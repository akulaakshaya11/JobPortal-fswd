export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
}

export interface CreateUserDto {
    name: string;
    email: string;
    password: string;
}

export interface GetUserResponse {
    user: User;
}

export interface AuthToken {
    token: string;
    expiresIn: number;
}