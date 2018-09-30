import React from 'react'
import TextField from '@material-ui/core/TextField'

export default ({ autoFocus, changeValue, value }) => (
  <TextField
    autoFocus={autoFocus}
    id="value"
    label="value"
    fullWidth
    multiline
    onChange={changeValue}
    rowsMax={12}
    value={value}
  />
)
