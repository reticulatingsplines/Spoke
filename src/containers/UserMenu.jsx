import PropTypes from "prop-types";
import React, { Component } from "react";
import { compose } from "react-apollo";
import { withRouter } from "react-router";
import gql from "graphql-tag";

import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import Popover from "@material-ui/core/Popover";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Divider from "@material-ui/core/Divider";

import { dataTest } from "../lib/attributes";
import loadData from "./hoc/load-data";
import withMuiTheme from "./hoc/withSetTheme";

export class UserMenuBase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      anchorEl: null
    };
    this.handleReturn = this.handleReturn.bind(this);
    this.handleRequestFaqs = this.handleRequestFaqs.bind(this);
  }

  handleTouchTap = event => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false
    });
  };

  handleMenuChange = (event, value) => {
    this.handleRequestClose();
    const { currentUser } = this.props.currentUser;
    if (value === "logout") {
      window.AuthService.logout();
    } else if (value === "account") {
      const { orgId } = this.props;
      if (orgId) {
        this.props.router.push(`/app/${orgId}/account/${currentUser.id}`);
      }
    } else {
      if (currentUser.superVolOrganizations.some(org => org.id === value)) {
        this.props.router.push(`/admin/${value}`);
      } else {
        this.props.router.push(`/app/${value}/todos`);
      }
    }
  };

  handleReturn = e => {
    e.preventDefault();
    const { orgId } = this.props;
    this.props.router.push(`/app/${orgId}/todos`);
  };

  handleRequestFaqs = e => {
    e.preventDefault();
    const { orgId } = this.props;
    this.props.router.push(`/app/${orgId}/faqs`);
  };

  handleAdminOrganizations = e => {
    e.preventDefault();
    this.props.router.push(`/organizations`);
  };

  handleOrgClick = (id, superVolOrgs) => {
    const { currentUser } = this.props.data;
    if (currentUser.is_superadmin) {
      this.props.router.push(`/admin/${id}`);
    } else if (superVolOrgs.some(org => org.id == id)) {
      this.props.router.push(`/admin/${id}`);
    } else {
      this.props.router.push(`/app/${id}`);
    }
  };

  renderAvatar(user) {
    return (
      <Avatar
        style={{
          color: this.props.muiTheme.palette.text.primary
        }}
      >
        {user.displayName.charAt(0)}
      </Avatar>
    );
  }

  renderAdminTools() {
    return (
      <div>
        <ListSubheader>Superadmin Tools</ListSubheader>
        <MenuItem
          value={"adminOrganizations"}
          onClick={this.handleAdminOrganizations}
        >
          Manage Organizations
        </MenuItem>
        <Divider />
      </div>
    );
  }

  render() {
    const { currentUser } = this.props.currentUser;
    if (!currentUser) {
      return <div />;
    }
    const adminOrganizations = currentUser.organizations
    const superVolOrganizations = currentUser.superVolOrganizations;
    const texterOrganizations = currentUser.texterOrganizations;
    const isSuperAdmin = currentUser.is_superadmin;
    console.log(`\
      adminOrganizations: ${JSON.stringify(adminOrganizations)}\
      superVolOrganizations: ${JSON.stringify(superVolOrganizations)}\
      texterOrganizations: ${JSON.stringify(texterOrganizations)}\
      `);
      let newline="\n";
    return (
      <div>
        <IconButton
          {...dataTest("userMenuButton")}
          onClick={this.handleTouchTap}
        >
          {this.renderAvatar(currentUser)}
        </IconButton>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
          transformOrigin={{ horizontal: "left", vertical: "top" }}
          onClose={this.handleRequestClose}
        >
          <MenuList onChange={this.handleMenuChange}>
            <MenuItem
              {...dataTest("userMenuDisplayName")}
              disabled={!this.props.orgId}
              onClick={event => {
                this.handleMenuChange(event, "account");
              }}
            style={{"padding-top": "3px", "padding-bottom": "3px"}}>
              <div>
                <ListItemIcon style={{position: "sticky", "min-width": "30px", "padding-top": "7px"}}>{this.renderAvatar(currentUser, 20)}
                </ListItemIcon>
                <span style={{"padding-left": "10px"}}><Typography variant="inherit" noWrap>{currentUser.displayName}
                </Typography><br />
              <span style={{textAlign: "left", color: "green", fontSize: "90%", "padding-left": "40px"}}>Your Profile - Click to Edit</span></span></div>
            </MenuItem>
            <Divider />
            {isSuperAdmin ? this.renderAdminTools() : <div />}
            <ListSubheader>Teams</ListSubheader>
            {organizations.map(organization => (
              <MenuItem
                key={organization.id}
                onClick={() => this.handleOrgClick(organization.id, superVolOrganizations)}
              >
                {organization.name}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem {...dataTest("home")} onClick={this.handleReturn}>
              Home
            </MenuItem>
            <MenuItem {...dataTest("FAQs")} onClick={this.handleRequestFaqs}>
              FAQs
            </MenuItem>
            <Divider />
            <MenuItem
              {...dataTest("userMenuLogOut")}
              onClick={event => {
                this.handleMenuChange(event, "logout");
              }}
            >
              Log out
            </MenuItem>
          </MenuList>
        </Popover>
      </div>
    );
  }
}

UserMenuBase.propTypes = {
  data: PropTypes.object,
  orgId: PropTypes.string,
  router: PropTypes.object
};

const queries = {
  currentUser: {
    query: gql`
      query getCurrentUserForMenu {
        currentUser {
        id
        displayName
        email
        is_superadmin
        ownerOrganizations: organizations(role: "OWNER") {
          id
          displayName
          email
          is_superadmin
	organizations: organizations(role: "ADMIN") {
		  id
		  name
	  }
          superVolOrganizations: organizations(role: "SUPERVOLUNTEER") {
            id
            name
          }
          texterOrganizations: organizations(role: "TEXTER") {
            id
            name
          }
        }
      }
    `,
    options: {
      fetchPolicy: "network-only"
    }
  }
};

export default compose(
  loadData({ queries }),
  withRouter,
  withMuiTheme
)(UserMenuBase);
