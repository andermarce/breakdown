import React from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import ArrowUpward from '@material-ui/icons/ArrowUpward'
import { useQuery } from 'react-apollo'
import {
  itemParentsQuery
} from './queries'

interface GroupData {
  id: string
  label: string
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backButton: {
      margin: theme.spacing(1)
    }
  })
)

function GroupsView(
  props: { groups: GroupData[] }
) {
  const classes = useStyles({})

  return (
    <>
      {props.groups.map(group => (
        <Link
          key={group.id}
          to={`/view/focus/${group.id}`}
        >
          <Button variant="outlined" className={classes.backButton}>
            <ArrowUpward />
            {group.label}
          </Button>
        </Link>
      ))}
    </>
  )
}

export function Groups(
  props: { childId: string }
) {
  const { data, loading } = useQuery(itemParentsQuery, {
    variables: {
      condition: {
        childId: props.childId
      }
    },
  })

  if (!data.allItemRelationships) return null

  const groups = data.allItemRelationships.nodes
    .map(
      group => group.itemByParentId
    )
    .filter(group => !!group)

  return loading && !groups.length
    ? null
    : <GroupsView groups={groups} />
}
