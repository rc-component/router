import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { Route, Link , Redirect } from '../src/index';
import transit from 'class-transit'

class Home extends Component {
  componentDidMount() {
    this.el = ReactDOM.findDOMNode(this)
  }
  onAppear(cb) {
    cb()
  }
  transit(name, style, cb) {
    this.cancel = transit(this.el, style[name], {
      active: style[name + 'Active'],
      timeout: 300,
      callback: cb
    })
  }
  onEnter(cb, style, type) {
    if (type == 'parent') {
      this.transit('parententer', style, cb)
    } else {
      cb()
    }
  }
  onLeave(cb, style, type) {
    if (type == 'child') {
      this.transit('parentleave', style, cb)
    } else {
      cb()
    }
  }
  render() {
    return (
      <div className="home view">
        <div><Link href="/manage/">manage</Link></div>
        <div><Link href="/users">users</Link></div>
        <div>home home home home home home home home home home</div>
      </div>
    )
  }
}

const Users = function (props) {
  return (
    <div className="users view">
      <button onClick={() => props.previous() }>back</button>
      <ul>
        <li><Link href="/manage/me">manage</Link></li>
        <li><Link href="/users/1">first user</Link></li>
        <li><Link href="/users/2">second user</Link></li>
      </ul>
    </div>
  )
}

const User = function (props) {
  return (
    <div className="view">
      <button onClick={() => props.previous()}>back</button>
      <div className="user">{props.params.id}</div>
      <div><Link href="/">home</Link></div>
      <div><Link href="/manage/me">manage</Link></div>
    </div>
  )
}

const About = function (props) {
  return <div>about</div>
}

const NotFound = function (props) {
  return <div>404</div>
}

const Me = function (props) {
  return <div className="view">
          <button onClick={() => { props.previous() }}>back</button>
          <div>me</div>
        </div>
}

const Order = function (props) {
  return (
    <div className="view">
      <button onClick={() => { props.previous() }}>back</button>
      <div>order {props.path}</div>
    </div>
  )
}

const OrderDetail = function (props) {
  return (
    <div className="view">
      <button onClick={() => { props.previous() }}>back</button>
      <div>order detail {props.params.id}</div>
    </div>
  )
}

const Links = function (props) {
  return (
    <div className="manage view">
      <button onClick={() => { Redirect('/')}}>back</button>
      <ul>
        <li><Link href="/manage/me">me</Link></li>
        <li><Link href="/manage/order">order</Link></li>
        <li><Link href="/manage/order/1">order 1</Link></li>
        <li><Link href="/manage/order/2">order 2</Link></li>
        <li><Link href="/users">users</Link></li>
      </ul>
    </div>
  )
}
const Manage = function (props) {
  return (
    <Route path="/manage" component={Links}>
      <Route path="/manage/me" component={Me}/>
      <Route path="/manage/order" component={Order}/>
      <Route path="/manage/order/:id" component={OrderDetail}/>
      <Route path="/manage/*" component={NotFound}/>
    </Route>
  )
}

function init() {
  let app = (
    <Route path="/" component={Home}>
      <Route path="/manage/*" component={Manage}/>
      <Route path="/users" component={Users}>
        <Route path="/users/:id" component={User}/>
      </Route>
      <Route path="/about" component={About}/>
      <Route path="*" component={NotFound}/>
    </Route>
  )
  ReactDOM.render(app , document.getElementById('app'))
}

init()

if (module.hot) {
  module.hot.accept(() => requestAnimationFrame( () => {
    ReactDOM.unmountComponentAtNode(document.getElementById('app'))
    init()
  }) )
}

