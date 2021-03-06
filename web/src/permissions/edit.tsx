import React, { useState } from 'react'
import { useMutation } from 'react-apollo'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Avatar from '@material-ui/core/Avatar'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import moment from 'moment'
import get from 'lodash/get'
import SearchDropdown from '../search/dropdown'
import { removePermissionFromItem, addPermissionToItem } from '../cache-handlers'
import {
  createPermissionMutation,
  deletePermissionMutation
} from './mutations'

interface Permission {
  id: string
  role: string
  timeCreated: Date
  userOrGroup: {
    id: string
    name: string
  } | null
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      padding: theme.spacing(0.5)
    },
    chip: {
      margin: theme.spacing(0.5)
    },
    permissionCard: {
      margin: theme.spacing(0.5)
    }
  })
)

export function EditPermission(props: {
  permission: Permission
}) {
  const [deletePermission] = useMutation(deletePermissionMutation)
  const [disabled, setDisabled] = useState(false)
  const firstLetter = props.permission.userOrGroup.name
    .substring(0, 1)
    .toUpperCase()

  const handleDelete = () => {
    setDisabled(true)
    deletePermission({
      variables: {
        permission: {
          id: props.permission.id
        }
      },
      update: (proxy) => {
        removePermissionFromItem(proxy, props.permission)
      }
    })
  }

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            {firstLetter}
          </Avatar>
        }
        action={
          <IconButton
            aria-label="Delete"
            disabled={disabled}
            onClick={handleDelete}
          >
            <DeleteIcon />
          </IconButton>
        }
        title={props.permission.userOrGroup.name}
        subheader={`granted ${moment(props.permission.timeCreated).calendar()}`}
      />
      <CardContent>
        <ToggleButtonGroup value={props.permission.role}>
          <ToggleButton key="READER" value="READER">
            Read
          </ToggleButton>
          <ToggleButton key="WRITER" value="WRITER">
            Read + Write
          </ToggleButton>
        </ToggleButtonGroup>
      </CardContent>
    </Card>
  )
}

export function NewPermission(props) {
  const [createPermission] = useMutation(createPermissionMutation)
  const [permission, setPermission] = useState({
    role: 'READER',
    timeCreated: new Date(),
    userOrGroup: null
  })
  const [disabled, setDisabled] = useState(false)
  const firstLetter = get(permission, ['userOrGroup', 'name'], '')
    .substring(0, 1)
    .toUpperCase()
  const name = get(permission, ['userOrGroup', 'name'])

  const handleChangeRole = (event, role) => {
    setPermission({
      ...permission,
      role
    })
  }

  const handleChangeUserOrGroup = (userOrGroup: any) => {
    setPermission({
      ...permission,
      timeCreated: new Date(),
      userOrGroup
    })
  }

  const handleSave = () => {
    setDisabled(true)
    createPermission({
      variables: {
        permissionInput: {
          permission: {
            itemId: props.itemId,
            userOrGroupId: permission.userOrGroup.id,
            role: permission.role
          }
        }
      },
      update: (proxy, result) => {
        addPermissionToItem(proxy, result.data.createPermission.permission)
        setDisabled(false)
        setPermission({
          role: 'READER',
          timeCreated: new Date(),
          userOrGroup: null
        })
      }
    })
  }

  return (
    <Card>
      <CardHeader
        avatar={firstLetter &&
          <Avatar>
            {firstLetter}
          </Avatar>
        }
        title={
          name
            ? name
            : (
              <SearchDropdown
                allowNew={false}
                handleSelect={handleChangeUserOrGroup}
                selectedItem={permission.userOrGroup}
                source="users"
              />
            )
        }
        subheader={
          permission.timeCreated &&
          `granted ${moment(permission.timeCreated).calendar()}`
        }
      />
      <CardContent>
        <ToggleButtonGroup
          exclusive
          onChange={handleChangeRole}
          value={permission.role}
        >
          <ToggleButton key="READER" value="READER">
            Read
          </ToggleButton>
          <ToggleButton key="WRITER" value="WRITER">
            Write
          </ToggleButton>
        </ToggleButtonGroup>
      </CardContent>
      <CardActions>
        <Button
          disabled={disabled}
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleSave}
        >
          Save
        </Button>
      </CardActions>
    </Card>
  )
}

export default function EditPermissions(props: {
  itemId: string,
  permissions: any[],
  public?: boolean
}) {
  const classes = useStyles({})

  return (
    <Grid container>
      {props.permissions.map((permission: any) => (
        <Grid
          item xs={6} sm={4} md={3}
          key={permission.id}
          className={classes.permissionCard}
        >
          <EditPermission
            permission={permission}
          />
        </Grid>
      ))}
      <Grid item xs={6} sm={4} md={3} className={classes.permissionCard}>
        <NewPermission itemId={props.itemId} />
      </Grid>
    </Grid>
  )
}
