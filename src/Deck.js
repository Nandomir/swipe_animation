import React, {Component} from 'react';
import { 
  View, 
  Animated,
  PanResponder,
  Dimensions
   } from 'react-native';

   const SCREEN_WIDHT = Dimensions.get('window').width;
   const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDHT; // adjusted proportionally to the size of the screen
   const SWIPE_OUT_DURATION = 350;

class Deck extends Component {
  constructor(props) {
    super(props);

    const position = new Animated.ValueXY();

    const panResponder = PanResponder.create({  // PanResponder is a self contained object
      onStartShouldSetPanResponder: () => true, // whenever user taps on the screen PanResponder handles the gesture and this function is called
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx , y: gesture.dy })
      },  // whenever user drags anything around the screen; 'gesture' argument holds info about the user movements - most important argument
      onPanResponderRelease: (event, gesture ) => {//user presses the screen and lets thecard go
        if (gesture.dx > SWIPE_THRESHOLD) {  // .dx value is negative when dragging left
          this.forceSwipe('right'); // forcibly animates the cards to the right
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe('left');
        } else {
          this.resetPosition(); // calling this reset the position of the card on the screen
        }
      }
    });

    this.state = { panResponder, position }; // following the PanResponder docs, even though it's never being called
  }

  forceSwipe(direction) {
    const x = direction === 'right' ? SCREEN_WIDHT : -SCREEN_WIDHT; // Tenary expression = if expression is true, return SCREEN_WIDTH, if not true then return -SCREEN_WIDTH

    Animated.timing(this.state.position, {
      toValue: { x , y: 0 },
      duration: SWIPE_OUT_DURATION  // needs this value (in miliseconds) on top of position
    }).start();  // timing method moves directly to state position
  };

  resetPosition() {
    Animated.spring(this.state.position, {
      toValue: { x: 0, y:0 },  // softly resets position of the card 
    }).start();
  };

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
