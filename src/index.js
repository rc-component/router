import event from 'event'
import React, { Component, PropTypes } from 'react'
import { exec, parseProps, getCurrentUrl } from './util'
import TransitionGroup from 'react-addons-transition-group'
import Animate from './animate'
import Emitter from 'emitter'

if (! typeof history.pushState === 'function') {
  throw new Error('rc-router need history.pushState to work')
}

let bus = new Emitter()
let first = true
bus.on('push', function () {
  first = false
  history.pushState.apply(history, arguments)
})

function handleLinkClick(e) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return;
  if (e.defaultPrevented) return
  if (e.stopImmediatePropagation) e.stopImmediatePropagation()
  e.stopPropagation()
  e.preventDefault()
  let curr = getCurrentUrl()
  let href = e.target.getAttribute('href')
  if (curr == href) return false
  bus.emit('push', {previous: curr}, '', href)
  return false
}

/**
 * Redirect to another path
 *
 * @public
 * @param {String} path
 */
export const Redirect = function (path) {
  if (!path) return
  let curr = getCurrentUrl()
  if (curr == path) return false
  bus.emit('push', {previous: curr}, '', path)
}

/**
 * Link helper function
 *
 * @public
 * @param {Object} props react props
 * @return React.element
 */
export const Link = ({ children, ...props }) => (
  <a {...props} onClick={ handleLinkClick }>{ children }</a>
)

/**
 * Route for react
 *
 * @public
 * @extends Component
 */
export class Route extends Component {
  static displayName = 'rc-route'
  static propTypes = {
    path: PropTypes.string,
    component: PropTypes.func,
    onChange: PropTypes.func
  }
  constructor(props) {
    super(props)
    this.state = { curr: null }
    this.routers = []
    let self = this
    this._onpushstate = function (e, title, url) {
      self.routeTo({state: e}, url)
    }
  }
  shouldComponentUpdate(newProps, newState) {
    if (this.state === newState) return false
    return true
  }
  componentWillMount() {
    this.type = 'appear'
    parseProps(this.routers, this.props)
    bus.on('push', this._onpushstate)
    this._onpopstate = e => {
      this.routeTo(e, getCurrentUrl())
    }
    event.bind(window, 'popstate', this._onpopstate)
    this.routeTo({state: {}}, getCurrentUrl())
  }
  routeTo(e, url) {
    let previous = (e && e.state) ? e.state.previous : null
    let pop = e.type === 'popstate'
    let params
    let next
    for (let router of this.routers) {
      params = exec(url, router.path)
      if (params) {
        next = router
        break
      }
    }
    if (!next) {
      this.setState({curr: null, pop})
    } else {
      this.setState({ curr: { ...next, previous, params }, pop })
    }
    if (this.props.onChange) this.props.onChange({
      // current url
      url: url,
      // previous fullpath
      previous: previous,
      curr: next,
      params: params
    })
  }
  componentWillUnmount() {
    bus.off('push', this._onpushstate)
    event.unbind(window, 'popstate', this._onpopstate)
    this.routers = []
  }
  componentWillUpdate(props, state) {
    let curr = this.state.curr
    if (!state.curr) {
      if (state.pop) {
        this.type = 'parent'
      } else if (curr && curr.parent && curr.parent == getCurrentUrl()) {
        this.type = 'parentempty'
      } else {
        this.type = 'destroy'
      }
      return
    }
    if (!curr) {
      this.type = 'appear'
      return
    }
    let newPath = state.curr.path
    if (state.curr.parent == curr.path) {
      this.type = 'child'
    } else if (state.pop || curr.parent.indexOf(newPath) === 0) {
      this.type = 'parent'
    } else if (curr.parent == state.curr.parent) {
      this.type = 'sibling'
    } else {
      this.type = 'enter'
    }
  }
  performAction(name, path, ...args) {
    if (!this.refs) return false
    let component = this.refs[path]
    if (!component) return false
    let fn = component['on' + name]
    if (typeof fn !== 'function') return false
    fn.apply(component, args)
    return true
  }
  render() {
    let curr = this.state.curr
    let type = this.type
    let child = null
    if (curr) {
      let ref = curr.component.prototype instanceof Component ? curr.path : null
      let current = React.createElement(curr.component, {
        ref: ref,
        type: this.type,
        params: curr.params,
        previous: function () {
          if (type == 'parent' && curr.parent) return Redirect(curr.parent)
          if (first && curr.parent) return Redirect(curr.parent)
          if (history.length > 1) return history.back()
          if (curr.parent) return Redirect(curr.parent)
          Redirect('/')
        },
        parent: () => Redirect(curr.parent)
      })
      child = <Animate
              onAppear={this.performAction.bind(this, 'Appear', curr.path)}
              onEnter={this.performAction.bind(this, 'Enter', curr.path)}
              onLeave={this.performAction.bind(this, 'Leave', curr.path)}
              key={curr.path}
              path={curr.path}
              getType={() => this.type}>
                {current}
              </Animate>
    }
    return (
      <TransitionGroup component="div" style={{position: 'relative'}}>
        {do{
          if (child) { child }
        }}
      </TransitionGroup>
    )
  }
}
