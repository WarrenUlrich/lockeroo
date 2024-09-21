import React, { Component } from 'react';
import './AuthBox.css';

interface RegisterBoxProps {
    logoUrl?: string;
    onRegister: (email: string, username: string, password: string) => void;
}

interface RegisterBoxState {
    username: string;
    email: string;
    password: string;
    errorMessage: string;
}

class RegisterBox extends Component<RegisterBoxProps, RegisterBoxState> {
    constructor(props: RegisterBoxProps) {
        super(props);
        this.state = {
            username: '',
            email: '',
            password: '',
            errorMessage: ''
        };
    }

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        this.setState({ [name]: value } as Pick<RegisterBoxState, keyof RegisterBoxState>);
    };

    handleSignUpSubmit = () => {
        const { onRegister } = this.props;
        const { username, email, password } = this.state;
        
        onRegister(email, username, password);
    };

    render() {
        const { logoUrl, onRegister } = this.props;
        const { username, email, password, errorMessage } = this.state;

        return (
            <div className="authbox-container">
                <div className="authbox">
                    <img
                        src={logoUrl || 'https://via.placeholder.com/100x100'}
                        className="authbox-logo"
                        alt="logo"
                    />
                    <div className="authbox-form">
                        <p className='error-message' style={{ display: errorMessage.length ? 'block' : 'none' }}>
                            {errorMessage}
                        </p>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            className="input-field"
                            value={username}
                            onChange={this.handleInputChange}
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="input-field"
                            value={email}
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
                        <button className="btn btn-success" onClick={this.handleSignUpSubmit}>
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default RegisterBox;
