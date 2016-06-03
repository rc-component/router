import { Children } from 'react'

export function parseProps(routers, props, parentProps) {
  if (props.path && props.component) {
    routers.push({
      path: props.path,
      component: props.component,
      parent: parentProps ? parentProps.path : parentPath(props.path)
    })
  }
  Children.forEach(props.children, function (child) {
    parseProps(routers, child.props, props)
  })
}

export function parentPath(path) {
  return path.replace(/\/[^\/]+$/,'') || '/'
}

export function getCurrentUrl() {
  let url = typeof location!=='undefined' ? location : EMPTY
  return `${url.pathname || ''}${url.search || ''}`
}

const EMPTY = {}

export function exec(url, route, opts=EMPTY) {
  let reg = /(?:\?([^#]*))?(#.*)?$/,
    c = url.match(reg),
    matches = {},
    ret
  if (c && c[1]) {
    let p = c[1].split('&')
    for (let i=0; i<p.length; i++) {
      let r = p[i].split('=')
      matches[decodeURIComponent(r[0])] = decodeURIComponent(r.slice(1).join('='))
    }
  }
  url = segmentize(url.replace(reg, ''))
  route = segmentize(route || '')
  let max = Math.max(url.length, route.length)
  for (let i = 0; i < max; i++) {
    if (url[i] == null && route[i] == '*') {
      ret = true
      break
    }
    if (route[i] == null ||url[i] == null) {
      ret = false
      break
    }
    let first = route[i].charAt(0)
    // no glob
    if (first !== '*' && first !== ':') {
      if (route[i] !== url[i]) {
        ret = false
        break
      }
    } else if (first == '*') {
      ret = true
      break
    } else {
      let name = route[i].replace(/^:/, '')
      matches[name] = url[i]
    }
  }
  if (opts.default!==true && ret===false) return false
  return matches
}


export function segmentize(url) {
  return strip(url).split('/')
}

export function rank(url) {
  return (strip(url).match(/\/+/g) || '').length
}

export function strip(url) {
  return url.replace(/(^\/+|\/+$)/g, '')
}
