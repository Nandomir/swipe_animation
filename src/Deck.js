import React, {Component} from 'react';
import { 
  View, 
  Animated,
  PanResponder,
  Dimensions
   } from 'react-native';

   const SCREEN_WIDHT = Dimensions.get('window').width;

class Deck extends Component {
  constructor(props) {
    super(props);

    const position = new Animated.ValueXY();

    const panResponder = PanResponder.create({  // PanResponder is a self contained object
      onStartShouldSetPanResponder: () => true, // whenever user taps on the screen PanResponder handles the gesture and this function is called
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx , y: gesture.dy })
      },  // whenever user drags anything around the screen; 'gesture' argument holds info about the user movements - most important argument
      onPanResponderRelease: () => {} // user presses the screen and lets the card go
    });

    this.state = { panResponder, position }; // following the PanResponder docs, even though it's never being called
  }

  getCardStyle() {
    const { position } = this.state;
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDHT * 1.5, 0, SCREEN_WIDHT * 1.5],
      outputRange: ['-100deg', '0deg', '100deg']
    });  // interpolation part system

    return {
      ...this.state.position.getLayout(), //adds a custom property 
      transform: [{ rotate }]   // accepts an array of different transforms, rotate - card rotates
    };
  }


  renderCards() {
    return this.props.data.map((item, index) => {
      if (index === 0) {
        return (
          <Animated.View
            key={item.id}
            style={this.getCardStyle()}
            {...this.state.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
          );
      }

      return this.props.renderCard(item);
    });
  }

  render() {
    return (
      <View>
        {this.renderCards()}
      </View>
      // panHandlers has callbacks that intercept presses from the user - ... is spreading the properties over the view. An exampe of connecting panResponder to an element. 
      );
  }
}

export default Deck;
