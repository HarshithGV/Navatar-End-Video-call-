import React from 'react';
import AgoraRTC from "agora-rtc-sdk";

const rtc = {
  client: null,
  joined: false,
  published: false,
  localStream: null,
  remoteStreams: [],
  params: {}
};

const option = {
  appID: "c924bd6fb57b44b1809c0746b78875d8",
  channel: "Navatar",
  uid: null,
  token: "007eJxTYCiI4n58pft0o4il9c9zhxevvxo4qevOUsk7asp8MxLz3hYpMCRbGpkkpZilJZmaJ5mYJBlaGFgmG5ibmCWZW1iYm6ZYnNz/N7khkJHhdSkjCyMDBIL47Ax+iWWJJYlFDAwAHUQiGw==",
  
  key: '26c02b2a66cb4ce1b237fac4e0b9bf12',
  secret: '3c905f9c598c421db6510de34f8ba1dd'
}

const HostPage = () => {
  const joinChannel = () => {
    rtc.client = AgoraRTC.createClient({ mode: "live", codec: "h264" });
    rtc.client.init(option.appID, () => {
      rtc.client.join(
        option.token ? option.token : null,
        option.channel, option.uid ? +option.uid : null,
        (uid) => {
          console.log("join channel: " + option.channel + " success, uid: " + uid);
          rtc.params.uid = uid;
          rtc.client.setClientRole("host");
          rtc.localStream = AgoraRTC.createStream({
            streamID: rtc.params.uid,
            audio: true,
            video: true,
            screen: false,
          });
          rtc.localStream.init(() => {
            console.log("init local stream success");
            rtc.localStream.play("local_stream");
            rtc.client.publish(rtc.localStream, (err) => {
              console.log("publish failed");
              console.error(err);
            });
          }, (err) => {
            console.error("init local stream failed ", err);
          });
          rtc.client.on("connection-state-change", (evt) => {
            console.log("host", evt)
          });
        },
        (err) => {
          console.error("client join failed", err)
        }
      );
    }, (err) => {
      console.error(err);
    });
  };

  const leaveEventHost = () => {
    rtc.client.unpublish(rtc.localStream, (err) => {
      console.log("publish failed");
      console.error(err);
    });
    rtc.client.leave((ev) => {
      console.log(ev);
    });
  };

  return (
    <div>
      <button onClick={joinChannel}>Join Channel as Host</button>
      <button onClick={leaveEventHost}>Leave Event Host</button>
      <div id="local_stream" className="local_stream" style={{ width: "400px", height: "400px" }}></div>
    </div>
  );
};

export default HostPage;
