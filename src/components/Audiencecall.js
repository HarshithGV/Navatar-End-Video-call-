import React, { useState, useEffect } from 'react';
import AgoraRTC from 'agora-rtc-sdk';

const Audience = ({ channel, appId, token }) => {
  const [client, setClient] = useState(null);
  const [joined, setJoined] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [localStream, setLocalStream] = useState(null);

  const option = {
    appID: 'c924bd6fb57b44b1809c0746b78875d8',
    channel: 'Navatar',
    token: "007eJxTYCiI4n58pft0o4il9c9zhxevvxo4qevOUsk7asp8MxLz3hYpMCRbGpkkpZilJZmaJ5mYJBlaGFgmG5ibmCWZW1iYm6ZYnNz/N7khkJHhdSkjCyMDBIL47Ax+iWWJJYlFDAwAHUQiGw==",
  
    uid: null,
  };

  useEffect(() => {
    const init = async () => {
      const agoraClient = AgoraRTC.createClient({ mode: 'live', codec: 'h264' });
      agoraClient.on('stream-added', (evt) => {
        const stream = evt.stream;
        agoraClient.subscribe(stream, (err) => {
          console.log('Failed to subscribe stream', err);
        });
      });

      agoraClient.on('stream-subscribed', (evt) => {
        const stream = evt.stream;
        setRemoteStreams((prevStreams) => [...prevStreams, stream]);
      });

      agoraClient.on('stream-removed', (evt) => {
        const stream = evt.stream;
        setRemoteStreams((prevStreams) => prevStreams.filter((s) => s.getId() !== stream.getId()));
        stream.stop();
        stream.close();
      });

      await agoraClient.init(option.appID);

      setClient(agoraClient);
    };

    init();
  }, [channel, appId, token]);

  const joinChannel = async () => {
    if (!client) {
      console.error('AgoraRTC client is not initialized');
      return;
    }

    try {
      const uid = await client.join(option.token, option.channel);
      console.log('AgoraRTC client joined channel: ', option.channel);

      const stream = AgoraRTC.createStream({
        audio: false,
        video: false,
        screen: false,
      });

      await stream.init();

      setLocalStream(stream);

      await client.publish(stream);

      setJoined(true);
    } catch (error) {
      console.error('Failed to join the AgoraRTC channel', error);
    }
  };

  const leaveChannel = async () => {
    try {
      await client.unpublish(localStream);
      await client.leave();
      setLocalStream(null);
      setRemoteStreams([]);
      setJoined(false);
    } catch (error) {
      console.error('Failed to leave the AgoraRTC channel', error);
    }
  };

  return (
    <div>
      {!joined ? (
        <button onClick={joinChannel}>Join Channel</button>
      ) : (
        <button onClick={leaveChannel}>Leave Channel</button>
      )}

      <div id="remote-streams">
        {remoteStreams.map((stream) => (
          <div key={stream.getId()} className="stream">
            <p>User {stream.getId()}</p>
            <div id={`remote-${stream.getId()}`}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Audience;
