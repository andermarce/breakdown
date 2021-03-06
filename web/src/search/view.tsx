import FormControl from '@material-ui/core/FormControl'
import Grid from '@material-ui/core/Grid'
import gql from 'graphql-tag'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import queryString from 'query-string'
import { useMutation, useQuery } from 'react-apollo'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CubeLoader } from '../loading'
import CreateNewItem from './create-new-item'
import {
  createRelationshipMutation
} from '../groups/queries'
import { addItemToAllItems } from '../cache-handlers'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: theme.spacing(1)
    },
    search: {
      fontSize: theme.typography.h2.fontSize
    },
    paper: {
      padding: theme.spacing(2),
      color: theme.palette.text.secondary,
    }
  })
)

const ItemLinkList = ({ items }) => (
  <List>
    {items.map(item => (
      <Link
        key={item.id}
        to={`/view/focus/${item.id}`}
      >
        <ListItem button>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{ color: 'textPrimary'}}
          />
        </ListItem>
      </Link>
    ))}
  </List>
)

function ItemButtonList({ items, onClick }) {
  const handleClick = (item) => () => {
    onClick(item)
  }

  return (
    <List>
      {items.map(item => (
        <ListItem button key={item.id} onClick={handleClick(item)}>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{ color: 'textPrimary'}}
          />
        </ListItem>
      ))}
    </List>
  )
}

const searchItems = gql`
query Search($input: String!) {
  search(term: $input) {
    nodes {
      id
      label
      parentId
      value
      timeCreated
      timeUpdated
    }
  }
}
`

function ConnectedItemList(props: {
  term: string,
  component: any,
  onClick?: Function
}) {
  const { data, loading } = useQuery(searchItems, {
    variables: {
      input: props.term
    },
  })

  if (loading) {
    return <CubeLoader />
  }

  const results = data.search.nodes

  if (!results.length) {
    return (
      <Typography
        color="textSecondary"
        align="center"
        variant="caption"
        paragraph={true}
      >
        Nothing here
      </Typography>
    )
  }

  return <props.component items={results} onClick={props.onClick} />
}

export default function Search(props) {
  const handleSearch = event => {
    props.history.replace({
      pathname: props.location.pathname,
      search: `?q=${encodeURIComponent(event.target.value)}`
    })
  }

  const handleCreateNew = newItem => {
    props.history.push(`view/focus/${newItem.id}`)
  }

  const classes = useStyles({})
  const parsedQueryString = queryString.parse(props.location.search)
  const q = typeof parsedQueryString.q === 'object'
      ? parsedQueryString.q[0]
      : parsedQueryString.q
  const query = decodeURIComponent( q || '')

  return (
    <div className={classes.root}>
      <Grid container>
        <Grid item xs={12}>
          <FormControl
            fullWidth
          >
            <TextField
              autoComplete="off"
              autoFocus
              id="search"
              label="search"
              onChange={handleSearch}
              type="text"
              inputProps={{ className: classes.search }}
              value={query}
            />
          </FormControl>
        </Grid>
        {query.length ? (
          <>
            <Grid item xs={6}>
              <Typography color="textSecondary">
                create something new
              </Typography>
              <CreateNewItem label={query} onCreate={handleCreateNew} />
            </Grid>
            <Grid item xs={6}>
              {query.length < 2 ? (
                <Typography
                  color="textSecondary"
                  align="center"
                  variant="caption"
                  paragraph={true}
                >
                  keep typing to search
                </Typography>
              ) : (
                <>
                  <Typography color="textSecondary">
                    search results
                  </Typography>
                  <ConnectedItemList component={ItemLinkList} term={query} />
                </>
              )}
            </Grid>
          </>
        )
        : (
          <Grid item xs={12}>
            <Typography
              color="textSecondary"
              align="center"
              variant="caption"
              paragraph={true}
            >
              what are you looking for?
            </Typography>
          </Grid>
        )}

      </Grid>
    </div>
    )
}

export function SearchView(props) {
  const classes = useStyles({})
  const [query, setQuery] = useState('')
  const [createRelationship] = useMutation(createRelationshipMutation)

  const handleSearch = (event) => {
    setQuery(event.target.value)
  }

  const handleCreateNew = (newItem) => {
    setQuery('')
    createRelationship({
      variables: {
        relationshipInput: {
          itemRelationship: {
            childId: newItem.id,
            parentId: props.parentId
          }
        }
      },
      update: (proxy, result) => {
        addItemToAllItems(proxy, {
          ...result.data.createItemRelationship.itemRelationship,
          itemByChildId: newItem
        }, props.parentId)
      }
    })
  }

  return (
    <div className={classes.root}>
      <Grid container>
        <Grid item xs={12}>
          <FormControl
            fullWidth
          >
            <TextField
              autoComplete="off"
              id="search"
              label="search"
              onChange={handleSearch}
              type="text"
              inputProps={{ className: classes.search }}
              value={query}
            />
          </FormControl>
        </Grid>
        {query.length ? (
          <>
            <Grid item xs={6}>
              <Typography color="textSecondary">
                something new
              </Typography>
              <CreateNewItem
                label={query}
                parentId={props.parentId}
                onCreate={handleCreateNew}
              />
            </Grid>
            <Grid item xs={6}>
              {query.length < 2 ? (
                <Typography
                  color="textSecondary"
                  align="center"
                  variant="caption"
                  paragraph={true}
                >
                  keep typing to search
                </Typography>
              ) : (
                <>
                  <Typography color="textSecondary">
                    search results
                  </Typography>
                  <ConnectedItemList
                    component={ItemButtonList}
                    term={query}
                    onClick={handleCreateNew}
                  />
                </>
              )}
            </Grid>
          </>
        )
        : (
          <Grid item xs={12}>
            <Typography
              color="textSecondary"
              align="center"
              variant="caption"
              paragraph={true}
            >
              add an item to this group
            </Typography>
          </Grid>
        )}
      </Grid>
    </div>
  )
}
