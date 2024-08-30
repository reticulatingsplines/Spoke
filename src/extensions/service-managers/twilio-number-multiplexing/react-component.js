/* eslint no-console: 0 */
import PropTypes from "prop-types";
import React from "react";
import Form from "react-formal";
import * as yup from "yup";
import GSForm from "../../../components/forms/GSForm";
import GSTextField from "../../../components/forms/GSTextField";
import GSSubmitButton from "../../../components/forms/GSSubmitButton";

import { css } from "aphrodite";

export class OrgConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        areaCodes: this.props.serviceManagerInfo.data.areaCodes
      }
    };
  }

  render() {
    console.log("this.props.serviceManagerInfo.data", this.props.serviceManagerInfo.data);
    console.log("twilio-number-multiplexing OrgConfig", this.props);
    const codeSchema = yup.object({
      areaCodes: yup
        .string()
        .nullable()
    });
    return (
      <div
        className={css(this.props.styles.formContainer)}
        style={{
          marginTop: 15
        }}
      >
        <div className={css(this.props.styles.form)}>
          <GSForm
            ref={this.form}
            schema={codeSchema}
            onSubmit={x => {
              //console.log("x is", x);
              //console.log("the concat is ", "[".concat(x.areaCodes,"]"));
              this.setState({
                data: {
                  areaCodes: JSON.parse("[".concat(x.areaCodes,"]"))
                }
              });
              //console.log("onSubmit", this.state.data);
              this.props.onSubmit({areaCodes: this.state.data.areaCodes});
            }}
            defaultValue={this.state.data}
          >
            <Form.Field
              as={GSTextField}
              label="Permitted Area Code(s) for this Organization:"
              name="areaCodes"
              helperText="Separate multiple area codes using commas, e.g. '123, 456'. An empty/blank value will allow any available number to be used for texting."
              fullWidth
            />
            <div className={css(this.props.styles.buttonRow)}>
              <Form.Submit
                as={GSSubmitButton}
                label={this.state.formButtonText}
                className={css(this.props.styles.button)}
              />
            </div>
          </GSForm>
        </div>
      </div>
    );
  }
}

OrgConfig.propTypes = {
  organizationId: PropTypes.string,
  serviceManagerInfo: PropTypes.object,
  inlineStyles: PropTypes.object,
  styles: PropTypes.object,
  saveLabel: PropTypes.string,
  onSubmit: PropTypes.func
};
