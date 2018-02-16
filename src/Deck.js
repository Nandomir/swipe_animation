import React, {Component} from 'react';
import { 
  View, 
  Animated,
  PanResponder,
   } from 'react-native';

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

  renderCards() {
    return this.props.data.map(item=> {
      return this.props.renderCard(item);
    });
  }

  render() {
    return (
      <Animated.View 
      style={this.state.position.getLayout()}
      {...this.state.panResponder.panHandlers}
      >
        {this.renderCards()}
      </Animated.View>
      // panHandlers has callbacks that intercept presses from the user - ... is spreading the properties over the view. An exampe of connecting panResponder to an element. 
      );
  }
}

export default Deck;
