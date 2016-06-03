import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import Overlay from '../index';

const boxStyles = {
  width: 100,
  height: 100,
  position: 'relative'
}

storiesOf('Overlay', module)
  .add('overlay shown', () => {
    return (
      <div style={{...boxStyles}}>
      <Overlay show={true}/>
    </div>
  )})
