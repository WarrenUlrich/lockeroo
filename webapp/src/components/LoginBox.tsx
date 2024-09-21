import React, { Component } from 'react';
import './AuthBox.css';

interface LoginBoxProps {
    logoUrl?: string;
    onLogin: (username: string, password: string) => void;
}

interface LoginBoxState {
    username: string;
    password: string;
}

class LoginBox extends Component<LoginBoxProps, LoginBoxState> {
    constructor(props: LoginBoxProps) {
        super(props);
        this.state = {
            username: '',
            password: ''
        };
    }

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        this.setState({ [name]: value } as Pick<LoginBoxState, keyof LoginBoxState>);
    };

    handleLoginSubmit = () => {
        const { username, password } = this.state;
        const { onLogin } = this.props;

        onLogin(username, password);
    };

    render() {
        const { logoUrl } = this.props;
        const { username, password } = this.state;

        return (
            <div className="authbox-container">
                <div className="authbox">
                    <img
                        src={logoUrl || 'https://via.placeholder.com/100x100'}
                        className="authbox-logo"
                        alt="logo"
                    />
                    <div className="authbox-form">
                        <input
                            type="username"
                            name="username"
                            placeholder="Username"
                            className="input-field"
                            value={username}
                            onChange={this.handleInputChange}
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="input-field"
                            value={password}
                            onChange={this.handleInputChange}
                        />
                        <button className="btn btn-primary" onClick={this.handleLoginSubmit}>
                            Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default LoginBox;
