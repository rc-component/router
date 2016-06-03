import React, { Component  } from 'react'
import ReactDom from 'react-dom'
import transit from 'class-transit'
import style from './style.css'

export default class Animate extends Component {
  componentDidMount() {
    this.el = ReactDom.findDOMNode(this)
  }
  componentWillUnmount() {
    if (this.cancel) this.cancel()
  }
  transit(name, callback) {
    if (this.cancel) this.cancel()
    this.cancel = transit(this.el, style[name], {
      active: style[name + 'Active'],
      timeout: 500,
      callback: callback
    })
  }
  componentWillAppear(callback) {
    if (this.props.onAppear(callback, style)) return
    callback()
  }
  componentWillEnter(callback) {
    let type = this.props.getType()
    if (this.props.onEnter(callback, style, type)) return
    if (type == 'sibling') {
      callback()
    } else if (type == 'parent') {
      this.transit('parententer', callback)
    } else {
      this.transit('childenter', callback)
    }
  }
  componentWillLeave(callback) {
    let type = this.props.getType()
    if (this.props.onLeave(callback, style, type)) return
    if (type == 'parent') {
      this.transit('childleave', callback)
    } else if (type == 'parentempty') {
      setTimeout(callback, 250)
    } else if (type == 'sibling'){
      callback()
    } else {
      this.transit('parentleave', callback)
    }
  }
  render() {
    let children = React.Children.toArray(this.props.children);
    return children[0] || <div></div>;
  }
}

