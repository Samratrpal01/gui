import React, { useEffect, useRef, useState } from 'react';

import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { WebLinksAddon } from 'xterm-addon-web-links';
import msgpack5 from 'msgpack5';

import { DEVICE_MESSAGE_TYPES as MessageTypes, DEVICE_MESSAGE_PROTOCOLS as MessageProtocols } from '../../../constants/deviceConstants';
import useWindowSize from '../../../utils/resizehook';
import XTerm from '../../common/xterm';

const MessagePack = msgpack5();

const fitAddon = new FitAddon();
const searchAddon = new SearchAddon();

export const byteArrayToString = body => String.fromCharCode(...body);

export const blobToString = blob => {
  return new Promise(resolve => {
    let fr = new FileReader();
    fr.onload = () => {
      resolve(fr.result);
    };
    fr.readAsArrayBuffer(blob);
  });
};

export const options = {
  cursorBlink: 'block',
  macOptionIsMeta: true,
  scrollback: 5000
};

let healthcheckTimeout = null;

// only matching absolute paths, so: /here/there - but not ../here or ./here or here/there
const unixPathRegex = new RegExp('(\\/([^\\0\\s!$`&*()\\[\\]+\'":;\\\\])+)');

export const Terminal = ({
  onDownloadClick,
  sendMessage,
  setSnackbar,
  setSessionId,
  setSocketClosed,
  setSocketInitialized,
  socket,
  socketInitialized,
  textInput,
  ...xtermProps
}) => {
  const xtermRef = useRef(null);
  const [dimensions, setDimensions] = useState({});
  const [healthcheckHasFailed, setHealthcheckHasFailed] = useState(false);
  const [snackbarAlreadySet, setSnackbarAlreadySet] = useState(false);
  const [term, setTerminal] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const size = useWindowSize();

  const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting));

  const healthcheckFailed = () => {
    setHealthcheckHasFailed(true);
    cleanupSocket();
  };

  useEffect(() => {
    if (!xtermRef.current?.terminal) {
      return;
    }
    const webLinksAddon = new WebLinksAddon((e, link) => onDownloadClick(link), { urlRegex: unixPathRegex }, true);
    xtermRef.current.terminal.loadAddon(webLinksAddon);
    try {
      fitAddon.fit();
    } catch {
      setSnackbar('Fit not possible, terminal not yet visible', 5000);
    }
  }, [xtermRef.current]);

  useEffect(() => {
    if (!socket) {
      return;
    }
    setTerminal(xtermRef.current.terminal);
    observer.observe(xtermRef.current.terminalRef.current);
    try {
      fitAddon.fit();
    } catch {
      setSnackbar('Fit not possible, terminal not yet visible', 5000);
    }

    socket.onopen = onSocketOpen;
    socket.onclose = onSocketClose;
    socket.onerror = onSocketError;

    // Remove the observer as soon as the component is unmounted
    return () => {
      observer.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (!socketInitialized) {
      return;
    }
    term.reset();
    fitAddon.fit();
    const { rows = 40, cols = 80 } = fitAddon.proposeDimensions() || {};
    const message = { typ: MessageTypes.New, props: { terminal_height: rows, terminal_width: cols } };
    sendMessage(message);
    setDimensions({ rows, cols });
    term.focus();
    socket.onmessage = onSocketMessage;
  }, [socketInitialized, term]);

  useEffect(() => {
    if (!socketInitialized || !term || !isVisible) {
      return;
    }
    fitAddon.fit();
    const newDimensions = fitAddon.proposeDimensions();
    if (newDimensions.rows != dimensions.rows || newDimensions.cols != dimensions.cols) {
      //
      const message = {
        typ: MessageTypes.Resize,
        props: { terminal_height: newDimensions.rows, terminal_width: newDimensions.cols }
      };
      sendMessage(message);
      setDimensions(newDimensions);
    }
  }, [size, isVisible]);

  useEffect(() => {
    if (!socketInitialized || !term || !textInput) {
      return;
    }
    term.paste(textInput);
  }, [socketInitialized, term, textInput]);

  const onSocketOpen = () => {
    setSnackbar('Connection with the device established.', 5000);
    setSocketInitialized(true);
  };

  const onSocketClose = event => {
    if (!snackbarAlreadySet && healthcheckHasFailed) {
      setSnackbar('Health check failed: connection with the device lost.', 5000);
    } else if (!snackbarAlreadySet && event.wasClean) {
      setSnackbar(`Connection with the device closed.`, 5000);
    } else if (!snackbarAlreadySet && event.code == 1006) {
      // 1006: abnormal closure
      setSnackbar('Connection to the remote terminal is forbidden.', 5000);
    } else if (!snackbarAlreadySet) {
      setSnackbar('Connection with the device died.', 5000);
    }
    if (xtermRef.current) {
      cleanupSocket();
    }
  };

  const onSocketMessage = event =>
    blobToString(event.data).then(data => {
      const {
        hdr: { props = {}, proto, sid, typ },
        body
      } = MessagePack.decode(data);
      if (proto !== MessageProtocols.Shell) {
        return;
      }
      switch (typ) {
        case MessageTypes.New: {
          if (props.status == 2) {
            setSnackbar(`Error: ${byteArrayToString(body)}`, 5000);
            setSnackbarAlreadySet(true);
            return cleanupSocket();
          } else {
            return setSessionId(sid);
          }
        }
        case MessageTypes.Shell:
          return term.write(new Uint8Array(body));
        case MessageTypes.Stop:
          return cleanupSocket();
        case MessageTypes.Ping: {
          if (healthcheckTimeout) {
            clearTimeout(healthcheckTimeout);
          }
          sendMessage({ typ: MessageTypes.Pong });
          //
          var timeout = parseInt(props.timeout);
          if (timeout > 0) {
            healthcheckTimeout = setTimeout(healthcheckFailed, timeout * 1000);
          }
          return;
        }
        default:
          break;
      }
    });

  const onSocketError = error => {
    setSnackbar(`WebSocket error: ${error.message}`, 5000);
    cleanupSocket();
  };

  const cleanupSocket = () => {
    socket.close();
    if (xtermRef.current) {
      setSocketInitialized(false);
      setSessionId(null);
      setSocketClosed();
    }
  };

  const onData = data => sendMessage({ typ: MessageTypes.Shell, body: data });

  return <XTerm ref={xtermRef} addons={[fitAddon, searchAddon]} options={options} onData={onData} {...xtermProps} />;
};

export default Terminal;
