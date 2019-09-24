import classNames from 'classnames'
import React, { Component } from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import FormControl from '@material-ui/core/FormControl'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import { Link } from 'react-router-dom'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    margin: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1)
    },
    withoutLabel: {
      marginTop: theme.spacing(3),
    },
    textField: {
      flexBasis: 200,
    },
    button: {
      margin: theme.spacing(1)
    },
    input: {
      display: 'none',
    }
  })
)

export default class Login extends Component<any> {
  state = {
    password: '',
    showPassword: false,
    username: ''
  }

  handleLogin = () => {
    this.props.login(this.state)
  }

  handleFormKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.handleLogin()
    }
  }

  handleUpdateName = event => {
    this.setState({
      username: event.target.value
    })
  }

  handleUpdatePassword = event => {
    this.setState({
      password: event.target.value
    })
  }

  handleClickShowPassword = () => {
    this.setState({
      showPassword: !this.state.showPassword
    })
  }

  handleMouseDownPassword = event => {
    event.preventDefault()
  }

  render() {
    const { loading } = this.props
    const classes = useStyles({})
    return (
      <Grid container>
        <Grid item xs={1} md={3} />
        <Grid item xs={10} md={6}>
          <form onKeyDown={this.handleFormKeyPress}>
            <Grid container spacing={8}>
                <Grid item xs={12}>
                  <FormControl
                    className={classNames(classes.margin, classes.textField)}
                    fullWidth
                  >
                    <TextField
                      autoComplete="on"
                      autoFocus={true}
                      id="username"
                      label="username"
                      onChange={this.handleUpdateName}
                      value={this.state.username}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl
                    className={classNames(classes.margin, classes.textField)}
                    fullWidth
                  >
                    <TextField
                      id="adornment-password"
                      label="password"
                      onChange={this.handleUpdatePassword}
                      type={this.state.showPassword ? 'text' : 'password'}
                      value={this.state.password}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="Toggle password visibility"
                              onClick={this.handleClickShowPassword}
                              onMouseDown={this.handleMouseDownPassword}
                            >
                              {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </FormControl>
                </Grid>
              <Grid item xs={6}>
                <Button
                  className={classes.button}
                  color="primary"
                  disabled={loading}
                  fullWidth
                  onClick={this.handleLogin}
                  size="large"
                  variant="contained"
                >
                  Login
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Link to="/register">
                  <Button
                    className={classes.button}
                    fullWidth
                    size="large"
                    variant="contained"
                  >
                    Register
                  </Button>
                </Link>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    )
  }
}
