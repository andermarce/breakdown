import gql from 'graphql-tag'
import get from 'lodash/get'
import React, { Component } from 'react'
import { Mutation, Query } from 'react-apollo'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import FormControl from '@material-ui/core/FormControl'
import Grid from '@material-ui/core/Grid'
import Input from '@material-ui/core/Input'
import TextField from '@material-ui/core/TextField'
import InputLabel from '@material-ui/core/InputLabel'
import Paper from '@material-ui/core/Paper'
import queryString from 'query-string'

import itemByIdQuery from '../focus/item-by-id.gql'
import SearchDropDown from '../search/dropdown'
import ValueView from '../focus/value-view'
import {
  addItemToAllItems,
  removeItemFromAllItems,
  updateItemInAllItems
} from '../cache-handlers'

const styles = theme => ({
  content: {
    padding: theme.spacing.unit * 4
  },
  root: {
    margin: theme.spacing.unit
  },
  margin: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  withoutLabel: {
    marginTop: theme.spacing.unit * 3,
  },
  save: {
    padding: theme.spacing.unit,
  },
})

class EditItemForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      label: '',
      value: '',
      parentId: get(props.item.itemByParentId, ['id'], null),
      ...props.item,
      __typename: undefined
    }
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    })
  }

  handleParentUpdate = (parentId) => {
    this.setState({
      parentId
    })
  }

  handleSave = async () => {
    const item = {
      label: this.state.label,
      parentId: this.state.parentId,
      value: this.state.value,
    }

    await this.props.upsert({
      variables: {
        itemInput: !this.props.new
          ? {
            id: this.props.item.id,
            itemPatch: item
          }
          : {
            item
          }
      }
    })

    this.props.onSave()
  }

  render() {
    const { classes } = this.props
    return (
      <Paper className={classes.root}>
        <Grid container className={classes.content}>
          <FormControl fullWidth>
            <Grid item xs={12}>
              <InputLabel htmlFor="label">label</InputLabel>
              <Input
                id="label"
                fullWidth
                onChange={this.handleChange('label')}
                type="text"
                value={this.state.label}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="value"
                label="value"
                onChange={this.handleChange('value')}
                fullWidth
                multiline
                rowsMax={12}
                value={this.state.value || ''}
              />
              <ValueView value={this.state.value} />
            </Grid>
            <Grid item xs={12}>
              <SearchDropDown
                onUpdate={this.handleParentUpdate}
                selectedItem={
                  this.props.parentItem
                  || get(this.props.item, 'itemByParentId')
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                color="primary"
                fullWidth
                onClick={this.handleSave}
                size="large"
                variant="contained"
              >
                Save
              </Button>
            </Grid>
          </FormControl>
        </Grid>
      </Paper>
    )
  }
}

const StyledEditItem = withStyles(styles)(EditItemForm)

const createItem = gql`
mutation createItem($itemInput: CreateItemInput!) {
  createItem(input: $itemInput) {
    item {
      id,
      label,
      parentId,
      value,
      itemByParentId {
        id,
        label
      }
    }
  }
}
`

export const CreateItem = (props) => (
  <Mutation
    mutation={createItem}
    update={(cache, result) => {
      const { item } = result.data.createItem
      addItemToAllItems(cache, item, item.parentId)
    }}
  >
    {(createItemMutation) => (
      <StyledEditItem
        item={props.item}
        upsert={createItemMutation}
        new
        onSave={props.onSave}
        {...props}
      />
    )}
  </Mutation>
)

export const CreateItemView = (props) => {
  const query = queryString.parse(props.location.search)

  if (query.parentId) {
    return (
      <Query
        query={itemByIdQuery}
        variables={{
          id: query.parentId
        }}
      >
        {({ data, loading }) => {
          return loading
            ? null
            : (
              <CreateItem
                item={{ itemByParentId: data.itemById }}
                onSave={props.history.goBack}
              />
            )
        }}
      </Query>
    )
  }

  return <CreateItem { ...props } />
}

const updateItem = gql`
mutation updateItem($itemInput: UpdateItemByIdInput!) {
  updateItemById(input: $itemInput) {
    item {
      id,
      label,
      parentId,
      value,
      itemByParentId {
        id,
        label
      }
    }
  }
}
`

export const EditItem = (props) => (
  <Mutation
    mutation={updateItem}
    update={(cache, result) => {
      const oldParentId = get(props.item, ['itemByParentId', 'id'], null)
      const { item } = result.data.updateItemById

      if (oldParentId === item.parentId) {
        updateItemInAllItems(cache, item, item.parentId)
      } else {
        removeItemFromAllItems(cache, item, oldParentId)
        addItemToAllItems(cache, item, item.parentId)
      }
    }}
  >
    {(editItemMutation) => (
      <StyledEditItem
        item={props.item}
        onSave={props.onSave}
        upsert={editItemMutation}
      />
    )}
  </Mutation>
)

export const EditItemView = (props) => (
  <Query
    query={itemByIdQuery}
    variables={{
      id: get(props.match.params, 'itemId')
    }}
  >
    {({ data, loading}) => {
     return loading
        ? null
        : <EditItem item={data.itemById} onSave={props.history.goBack} />
    }}
  </Query>
)