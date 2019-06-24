import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Switch, Route } from 'react-router'

import AddLink from './edit/add-link'
import SearchLink from './search/link'

const styles = theme => ({
  root: {
    bottom: theme.spacing(1),
    position: 'fixed',
    right: theme.spacing(1)
  }
})

const FloatingActionButtons = ({ classes }) => (
  <div className={classes.root}>
    <Switch>
      <Route path="/search" component={null} />
      <Route component={SearchLink} />
    </Switch>
  </div>
)

export default withStyles(styles)(FloatingActionButtons)
