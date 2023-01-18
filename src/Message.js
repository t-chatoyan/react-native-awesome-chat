import React, {Component} from 'react';
import { Text, View, Image, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import Swipeable from 'react-native-swipeable';
import moment from 'moment';

const {width, height} = Dimensions.get("window")
const dateToCondensedLocaleDateString = (date) => {
  if (date) {
    return moment(date).format('MM/D/YYYY, h:mm:ss');
  }
  return "";
}

export default class MessageComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messageHeight: 0,
      sent : true,
      loadImage: false
    };
  }

  tryAgain = () => {
    if(this.state.sent)
      return;
    this.props.tryAgain(this.props.id);
  }

  markUnsent = () => {
    this.setState({sent : false})
  }

  markSent = () => {
    this.setState({sent : true})
  }

  render() {
    let message = { ... this.props }
    let timestampStyle =  message.type == "sent" ?
      {color : this.props.timestampColor || "grey", position : 'absolute', bottom : message.image_uri ? '15%' : '3%'}
      : {color : this.props.timestampColor || "grey", position : 'absolute', bottom : message.image_uri ? '15%' : '3%', right : '0%'}
    let Timestamp = <View style={{height : this.state.messageHeight, position : 'relative'}}>
      <Text style={timestampStyle}>
        {message.timestamp ? dateToCondensedLocaleDateString(new Date(message.timestamp * 1000)) : ""}
      </Text>
    </View>;

    var align =  "flex-end";
    var messageColor = "#147efb";
    var textColor = "white";
    if (message.type == "received") {
      align = "flex-start";
      messageColor = "lightgrey";
      textColor = "black";
    }
    var defaultMessageStyle = { backgroundColor: message.type == "sent" && !this.state.sent ? "lightblue" : messageColor }
    var defaultTextStyle = {color: textColor, padding: "3%"}

    var finalTextStyle = message.type == "sent"
      ? !this.state.sent && this.props.unsentTextStyle != null
        ? this.props.unsentTextStyle
        : this.props.sentTextStyle != null
          ? this.props.sentTextStyle
          : defaultTextStyle
      : this.props.receivedTextStyle != null
        ? this.props.receivedTextStyle
        : defaultTextStyle

    var finalMessageStyle = message.type == "sent"
      ? !this.state.sent && this.props.unsentMessageStyle != null
        ? this.props.unsentMessageStyle
        : this.props.sentMessageStyle != null
          ? this.props.sentMessageStyle
          : defaultMessageStyle
      : this.props.receivedMessageStyle != null
        ? this.props.receivedMessageStyle
        : defaultMessageStyle

    return (
      <Swipeable
        rightContent={message.type == "sent" ? Timestamp : null}
        leftContent={message.type == "received" ? Timestamp : null}>
        {
          ! message.image_uri ?
            <TouchableWithoutFeedback onPress={this.tryAgain}>
              <View style={{ width: width, alignItems: align }}>
                <View
                  key={message.id}
                  onLayout={event => this.setState({messageHeight: event.nativeEvent.layout.height})}
                  style={{...styles.messageStyle, ...finalMessageStyle}}
                >
                  <Text style={{padding : '3%', ... finalTextStyle}}>
                    {message.body}
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
            :
            <TouchableWithoutFeedback onPress={this.tryAgain}>
              <View
                key={message.id}
                style={{alignItems: align, flex: 1, resizeMode: 'contain'}}
                onLayout={event => this.setState({messageHeight: event.nativeEvent.layout.height})}
              >
                <Image
                  key={message.id}
                  source={{uri : message.image_uri, scale: 1}}
                  style={styles.imageStyle}
                  onLoadStart={() => this.setState({loadImage: true})}
                  onLoadEnd={() =>  this.setState({loadImage: false})}
                />
                {this.state.loadImage && <View style={styles.imageLoader} />}
              </View>
            </TouchableWithoutFeedback>
        }
        {
          !this.state.sent ?
            (
              <Text style={{...styles.sendAgainTextStyle, color : this.props.errorColor || "red"}}>
                Failed to send. Tap to try again.
              </Text>
            ) : null
        }
      </Swipeable>
    );
  }
}

const styles = StyleSheet.create({
  imageLoader : {
    height : 100,
    width : 100,
    marginBottom : '5%',
    marginLeft : '5%',
    marginRight : '5%',
    borderRadius : 10,
    backgroundColor: '#f3f3f3',
    borderColor: '#dcdcdc',
    borderWidth: 1
  },
  imageStyle : {
    height : 100,
    width : 100,
    marginBottom : '5%',
    marginLeft : '5%',
    marginRight : '5%',
    borderRadius : 10,
    resizeMode: 'cover',
  },
  messageStyle : {
    marginLeft: "5%",
    marginRight: "5%",
    borderRadius: 20,
    marginBottom: "5%"
  },
  sendAgainTextStyle : {
    fontSize : 12,
    textAlign : 'right',
    paddingRight : '5%',
    paddingBottom : '5%',
    marginTop : '-3%'
  }
})

