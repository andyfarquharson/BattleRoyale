import styled, { keyframes } from 'styled-components'

import spritePageRight from '../moveRight.png'
import spritePageLeft from '../moveLeft.png'
import spritePageUp from '../moveUp.png'
import spritePageDown from '../moveDown.png'

const animation = keyframes`
100% { background-position: -1000px; }
`;

  const SpriteDown = styled.div`
    height: 30px;
    width: 36px;
    position: absolute;
    background: url(${spritePageDown}) left top;
    animation: ${animation} .4s steps(2) infinite; 
  `;    
  const SpriteUp = styled.div`
    height: 30px;
    width: 36px;
    position: relative;
    background: url(${spritePageUp}) left top;
    animation: ${animation} .4s steps(2) infinite; 
  `;
  const SpriteRight = styled.div`
    height: 30px;
    width: 36px;
    position: absolute;
    background: url(${spritePageRight}) left top;
    animation: ${animation} .4s steps(2) infinite; 
  `;
  const SpriteLeft = styled.div`
    height: 29px;
    width: 36px;
    position: absolute;
    background: url(${spritePageLeft}) left top;
    animation: ${animation} .4s steps(2) infinite; 
  `;
const Sprite = (props) => {
  console.log('sprite~~~', props);
  const {direction, top, left} = props;
    if (direction === 'up') {
      return (
          <SpriteUp/>
      )
    } else if (direction === 'down') {
      return (
          <SpriteDown/>
      )
    } else if (direction === 'left') {
      return (
          <SpriteLeft/>
      )
    } else if (direction === 'right') {
      return (
          <SpriteRight/>
      )
    } else {
      return <SpriteUp/>
    }
}

export default Sprite;