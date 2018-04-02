import React, {Component} from 'react';
import { 
  View, 
  Animated,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  UIManager
   } from 'react-native';

   const SCREEN_WIDHT = Dimensions.get('window').width;
   const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDHT; // adjusted proportionally to the size of the screen
   const SWIPE_OUT_DURATION = 350;

class Deck extends Component {
  static defaultProps = {
    onSwipeRight: () => {}, 
    onSwipeLeft: () => {}
    // when this prop is not passed, component will use this function as a default
    // static methods are alternative to constructors
  }

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

    this.state = { panResponder, position, index: 0 }; // following the PanResponder docs, even though it's never being called
  }

  componentWillUpdate() { // want the LayoutAnimation to be use at any time when app updates
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    // compatibility code for andoid
    LayoutAnimation.spring();
  }

  forceSwipe(direction) {
    const x = direction === 'right' ? SCREEN_WIDHT : -SCREEN_WIDHT; // Tenary expression = if expression is true, return SCREEN_WIDHT, if not true then return -SCREEN_WIDHT

    Animated.timing(this.state.position, { // timing method moves directly to state position
      toValue: { x , y: 0 },
      duration: SWIPE_OUT_DURATION  // needs this value (in miliseconds) on top of position
    }).start(() => this.onSwipeComplete(direction));  // callback function being executed right after the animation
  };

  onSwipeComplete(direction) {
    const { onSwipeLeft, onSwipeRight, data } = this.props;
    const item = data[this.state.index]; // 

    direction == 'right' ? onSwipeRight(item) : onSwipeLeft(item); // detects whenever user has swiped a card
    this.state.position.setValue({ x: 0, y:0 }); // forcibly/programmatically reset the value of the positon
    this.setState({ index: this.state.index + 1 }); 
  }

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
    if (this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards();
    } // when all cards are swiped, this method is called from App.js

    return this.props.data.map((item, i) => {
      if (i < this.state.index) { return null; }

      if (i === this.state.index) {
        return (
          <Animated.View
            key={item.id}
            style={[this.getCardStyle(), styles.cardStyle]} // when passing multiple styles, pass an array
            {...this.state.panResponder.panHandlers} // panHandlers has callbacks that intercept presses from the user - ... is spreading the properties over the view. An exampe of connecting panResponder to an element.
          >
            {this.props.renderCard(item)}
          </Animated.View>
          );
      }

      return (
        <Animated.View 
          key={item.id} 
          style={[styles.cardStyle, { top: 10 * (i - this.state.index) }]}
          >
        {this.props.renderCard(item)}
        </Animated.View>
        );
    }).reverse(); // reverses the .map array from line 88
  }

  render() {
    return (
      <View>
        {this.renderCards()}
      </View> 
      );
  }
}

const styles = {
  cardStyle: {
    position: 'absolute', // absolute stacks all the cards on the top of application
    width: SCREEN_WIDHT
  }
}

export default Deck;
