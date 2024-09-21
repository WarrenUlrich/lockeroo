import React, { Component } from 'react';
import './PasswordEntry.css';

interface SavedPassword {
  SiteName: string;
  SiteURL: string;
  Username: string;
  Password: string;
  Notes: string;
  CreatedAt: Date;
}

interface PasswordEntryProps {
  data: SavedPassword;
}

interface PasswordEntryState {
  isExpanded: boolean;
}

class PasswordEntry extends Component<PasswordEntryProps, PasswordEntryState> {
  constructor(props: PasswordEntryProps) {
    super(props);
    this.state = {
      isExpanded: false
    };

    this.toggleDetails = this.toggleDetails.bind(this);
  }

  toggleDetails() {
    this.setState((prevState) => ({
      isExpanded: !prevState.isExpanded
    }));
  }

  render() {
    const { data } = this.props;
    const { isExpanded } = this.state;

    return (
      <div className="container">
        <div className={`entry ${isExpanded ? 'expanded' : ''}`} onClick={this.toggleDetails}>
          <div>
            <span className="site-name">{data.SiteName}</span>
            (<a className="site-url" href={data.SiteURL} target="_blank" rel="noopener noreferrer">{data.SiteURL}</a>) - 
            <span className="username">{data.Username}</span>
          </div>
          <div className={`expand ${isExpanded ? 'expanded' : ''}`}>&#9654;</div>
        </div>
        <div className={`details ${isExpanded ? 'expanded' : ''}`}>
          <p><strong>Password:</strong> <span className="password">{data.Password}</span></p>
          <p><strong>Notes:</strong> <span className="notes">{data.Notes}</span></p>
          <p><strong>Created At:</strong> <span className="created-at">{data.CreatedAt.toLocaleDateString()}</span></p>
        </div>
      </div>
    );
  }
}

export default PasswordEntry;
