import { Input } from '../shared/input/input'
import { Button } from '../shared/button/button'
import { SyntheticEvent } from 'react';

import { useAuthStore } from '../app/model/use-auth-store';
import { useLoginStore } from '../entities/login/model/login-store';

export const AdminLogin = () => {
    const { login, password, setLogin, setPassword } = useLoginStore()
    const { setAuth } = useAuthStore();


    const isDisabled = !login.trim() || !password.trim();

    const handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();

        console.log("Отправка логина:", login);
        console.log("Отправка пароля:", password);

        setLogin('')
        setPassword('')

        setAuth(true);

        setTimeout(() => window.location.hash = '/admin-applications', 1000)
    }

    return (
        <form className="flex flex-col justify-between h-full" onSubmit={handleSubmit}>
            <div className="flex flex-col items-center">
                <span className='text-dark font-[600] text-[24px]'>Вход</span>
                <Input
                    type="text"
                    className="w-full mt-8"
                    placeholder='Логин'
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                />
                <Input
                    type="password"
                    className="w-full mt-2"
                    placeholder='Пароль'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <Button
                variant={isDisabled ? 'disabled' : 'default'}
                label="Войти"
                className="mt-auto"
                type="submit"
                disabled={isDisabled}
            />
        </form>
    )
}
