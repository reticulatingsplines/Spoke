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
      areaCodes: this.props.serviceManagerInfo.data.areaCodes
    };
  }

  render() {
    console.log("twilio-number-multiplexing OrgConfig", this.props);
    const codeSchema = yup.object({
      areaCodes: yup
        .string()
        .nullable()
        .json()
        .array()
        .of(
          yup
            .string()
            .nullable()
            .length(3)
            .regex("[0-9]{3}", { excludeEmptyString: true })
        )
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
              console.log("onSubmit", x);
              this.props.onSubmit(x);
            }}
            defaultValue={this.state.areaCodes}
          >
            <Form.Field
              as={GSTextField}
              label="Area Codes to Use"
              name="areaCodes"
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
