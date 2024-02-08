import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Image,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  SafeAreaView,
  Keyboard,
  ImageBackground,
  Platform
} from "react-native";
import { Button, Input } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import ImageResizer from "react-native-image-resizer";
import MessageComponent from './Message';
import sha1 from 'js-sha1';
import { PermissionsAndroid } from "react-native";
const keyboardVerticalOffsetsIOS = {
  "812" : 44,
  "667" : 20,
  "736" : 20
}

const keyboardVerticalOffsetsANDROID = {
  "774.8571428571429" : -260,
  "592" : -230,
  "683.4285714285714" : -260,
  "816" : -260
}

const { width, height } = Dimensions.get("window");

class AwesomeChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: "",
    };
    this.messageRefs = {};
  }

  async requestCameraPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "App needs access to your camera.",
          buttonPositive: "OK",
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Camera permission granted");
      } else {
        console.log("Camera permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  }

  sendImage = (image) => {
    if (!(image.didCancel || image.error || image.errorCode)) {
      if (image.assets.length && image.assets[0].uri) {
        ImageResizer.createResizedImage(
          image.assets[0].uri,
          1820,
          2546,
          'JPEG',
          100,
          0,
        )
          .then((data) => {
            let message = {
              body: '',
              id: (data.uri + new Date().toString()),
              timestamp: '',
              type: 'sent',
              image_uri: data.uri,
            };
            this.sendMessage(message);
          })
          .catch((e) => {
            console.log(e);
          });
      }
    }
  };

  sendPicture = async () => {
    await launchImageLibrary(imagePickerOptions, this.sendImage);
  };

  takePicture = async () => {
    await this.requestCameraPermission();
    await launchCamera(imagePickerOptions, this.sendImage);
  };

  getMessageById = (id) => {
    for(var i = 0; i < this.props.messages.length; i++){
      if(this.props.messages[i].id == id){
        return this.props.messages[i];
      }
    }
    return null;
  }

  sendPicture = async () => {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: {
        skipBackup: true
      }
    };
    await launchImageLibrary(options, (response) => {
      if (!(response.didCancel || response.error || response.customButton)) {
        if (response.assets.length && response.assets[0].uri) {
          let message = {
            body: "",
            id: sha1(response.assets[0].uri + new Date().toString()),
            timestamp: "",
            type: "sent",
            image_uri: response.assets[0].uri
          }
          this.sendMessage(message)
        }
      }
    });
  }


  sendMessageAgain = async (id) => {
    this.messageRefs[id].markSent();
    let message = this.getMessageById(id);
    let success = await this.props.onSendMessage(message);
    if (!success) {
      this.messageRefs[id].markUnsent();
    }
  };

  craftMessage = async () => {
    if (this.state.input == '') {
      return;
    }
    let message = {
      body: this.state.input,
      id: sha1(this.state.input + new Date().toString()),
      timestamp: '',
      type: 'sent',
      image_uri: '',
    };
    this.sendMessage(message);
  };

  sendMessage = async (message) => {
    this.setState(
      {
        input: '',
      },
      async () => {
        let success = await this.props.onSendMessage(message);
        if (!success) {
          this.messageRefs[message.id].markUnsent();
        }
      },
    );
  };

  leftIcon = () => (
    <View
      style={{
        flexDirection: 'row',
      }}
    >
      <TouchableOpacity onPress={this.takePicture} style={{marginRight: 12}}>
        {this.props.leftIcon || (
          <Icon name="camera" size={24} color={'#bcbcbc'} />
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={this.sendPicture}>
        {this.props.leftIcon || (
          <Icon name="paperclip" size={24} color={'#bcbcbc'} />
        )}
      </TouchableOpacity>
    </View>
  );

  renderChatView = () => {
    const rightIcon = (
      <TouchableOpacity onPress={this.craftMessage}>
        {this.props.rightIcon || (
          <Icon
            name="arrow-circle-up"
            size={30}
            color={this.props.rightIconColor || '#b8ccff'}
          />
        )}
      </TouchableOpacity>
    );

    return (
      <>
        <View style={styles.scrollViewContainerStyle}>
          <ScrollView
            onContentSizeChange={(contentWidth, contentHeight) => this._scroll.scrollToEnd({ animated: true }) }
            contentContainerStyle={{ flexGrow: 1 }}
            ref={ref => (this._scroll = ref)}
            keyboardShouldPersistTaps='handled'
            keyboardDismissMode="on-drag"
          >
            <View style={styles.messagesContainerStyle}>
              {this.props.messages.map((message, index)=> (
                <MessageComponent
                  ref={(ref) => this.messageRefs[message.id] = ref}
                  body={message.body}
                  id={message.id}
                  key={index}
                  image_uri={message.image_uri}
                  timestamp={message.timestamp}
                  type={message.type}
                  tryAgain={this.sendMessageAgain}
                  sentMessageStyle={this.props.sentMessageStyle || null}
                  unsentMessageStyle={this.props.unsentMessageStyle || null}
                  receivedMessageStyle={this.props.receivedMessageStyle || null}
                  sentTextStyle={this.props.sentTextStyle || null}
                  unsentTextStyle={this.props.unsentTextStyle || null}
                  receivedTextStyle={this.props.receivedTextStyle || null}
                  timestampColor={this.props.timestampColor || null}
                  errorColor={this.props.errorColor || null}
                />)
              )}
            </View>
          </ScrollView>
        </View>
        <View style={styles.inputViewStyle}>
          <Input
            onFocus={()=>this._scroll.scrollToEnd({ animated: true })}
            placeholder="Type a message ..."
            placeholderTextColor={this.props.placeholderTextColor}
            onChangeText={text => this.setState({ input: text })}
            value={this.state.input}
            multiline
            inputContainerStyle={{...styles.inputContainerStyle, ... this.props.inputContainerStyle}}
            inputStyle={{...styles.inputStyle, ... this.props.inputStyle}}
            leftIcon={this.leftIcon}
            rightIcon={rightIcon}
            leftIconContainerStyle={{paddingLeft : "1.5%"}}
            rightIconContainerStyle={{paddingRight: "1.5%"}}
          />
        </View>
      </>
    )
  }

  render() {
    return (
      <KeyboardAvoidingView
        behavior="padding"
        enabled
        keyboardVerticalOffset={
          Platform.select({
            ios: () => keyboardVerticalOffsetsIOS[height] || 20,
            android: () => keyboardVerticalOffsetsANDROID[height] || -260
          })()
        }
        style={{...styles.containerStyle, backgroundColor: this.props.backgroundColor || "white"}}>
        <SafeAreaView style={{flex : 1}}>
          {
            this.props.backgroundImage ?
              <ImageBackground
                style={{height : '100%', width : '100%'}}
                source={this.props.backgroundImage}
              >
                {this.renderChatView()}
              </ImageBackground>
              :
              <>
                {this.renderChatView()}
              </>
          }
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  scrollViewContainerStyle : {
    height: '88%',
    position : 'relative',
    paddingTop : "5%",
    paddingBottom : '3%'
  },
  messagesContainerStyle : {
    alignItems: "center",
    flexGrow: 1
  },
  containerStyle : {
    position: "relative",
    flex : 1
  },
  inputViewStyle : {
    position: "absolute",
    bottom: "0%",
    height : '12%',
    justifyContent : 'center'
  },
  inputContainerStyle : {
    borderWidth: 1,
    borderRadius: 20,
    width: 0.95 * width,
    backgroundColor: "white"
  },
  inputStyle : {
    paddingLeft: "2%",
    marginTop: "1.5%",
  }
});

export default AwesomeChat;
