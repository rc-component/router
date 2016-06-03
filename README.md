# router

Router Component for [react](https://facebook.github.io/react/).

## Design philosophy

* Keep it smiple, first match wins.
* Support nested routes.
* Easy to match url, `:name` to match named parameter, `*` matches everything remained.
* Build in default IOS animation.

## Install

    npm i rc-router

## Usage

``` jsx
import { Route, Link , Redirect } from 'rc-router';
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
```

## Props

name   | type   | default    | description
-------| ------ | ---------- | ------------
path   | string | null       | match role of path
component   | func | null    | shown component
onchange | func | null | path change event handler, for root route only

## Helper exports

* `Link` for simple link with href for location redirect
* `Redirect` function called with path

## Assigned props

Component rendered on route props would be assigned with additional props.

* `params` object contains all params (including query object).
* `type` render type of component, could be `parent` `child` `sibling` `enter`.
* `previous` function for redirect to reasonable previous component.
* `parent` function for redirect to parent component.

# License

MIT
