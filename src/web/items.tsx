import gql from 'graphql-tag'
import { get } from 'lodash'
import { withStyles } from '@material-ui/core/styles'
import React from 'react'
import { Query } from 'react-apollo'
import { Link, withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import {
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core'

import { EditItem } from './edit-item'

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
})

const ItemsList = (props) => {
  const { classes, items } = props
  if (!get(items, ['data', 'allItems', 'nodes'])) return null
  return (
    <div className={classes.root}>
      <List component="nav">
        {items.data.allItems.nodes.map(item => {
          return props.match.params.itemId === item.id ? (
            <ListItem key={item.id}>
                <EditItem oldItem={item} />
            </ListItem>
          ) : (
            <Link to={`/home/${item.id}`} key={item.id}>
              <ListItem button>
                <ListItemText
                  primary={item.label}
                  secondary={item.value}
                />
              </ListItem>
            </Link>
          )
        })}
      </List>
    </div>
  )
}

const StyledItemsList = compose(
  withRouter,
  withStyles(styles)
)(ItemsList)

const query = gql`
query AllItems {
  allItems {
    nodes {
      id,
      label,
      value
    }
  }
}
`

export default () => (
  <Query query={query}>
    {(itemsQuery) => (
      <StyledItemsList items={itemsQuery} />
    )}
  </Query>
)
