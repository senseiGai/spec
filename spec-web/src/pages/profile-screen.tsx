import { CategoriesList } from "../features/categories-list/ui/categories-list";
import { ProfileHeader } from "../features/profile-header/ui/profile-header";
import { StatisticsCard } from "../features/statistics-card/ui/statistics-card";
import { Button } from "../shared/ui/button/button";

import { useAuthData } from "../entities/auth-user/api/use-auth-data";

const categories = [
    'Сантехника - Установка смесителя',
    'Замки - Вскрытие гаражей',
    'Замки - Вскрытие авто',
    'Мебель - Шкафы',
    'Мебель - Столы',
    'Мебель - Диваны',
    'Мебель - Кровати',
    'Мебель - Тумбы',
    'Мебель - Шторы',
    'Мебель - Кухонные гарнитуры',
    'Мебель - Мебель для ванной',
    'Мебель - Мебель для спальни',
    'Мебель - Мебель для гостиной',
    'Мебель - Мебель для прихожей',
    'Мебель - Мебель для офиса',
    'Мебель - Мебель для склада',
    'Мебель - Мебель для дачи',
    'Мебель - Мебель для магазина',
    'Мебель - Мебель для ресторана',
    'Мебель - Мебель для кафе',
    'Мебель - Мебель для отеля',
    'Мебель - Мебель для санатория',
    'Мебель - Мебель для больницы',
    'Мебель - Мебель для школы',
    'Мебель - Мебель для детского сада',
    'Мебель - Мебель для библиотеки',
    'Мебель - Мебель для музея',
    'Мебель - Мебель для театра',
    'Мебель - Мебель для концертного зала',
    'Мебель - Мебель для стадиона',
    'Мебель - Мебель для бассейна',
    'Мебель - Мебель для спортзала',
    'Мебель - Мебель для фитнес-центра',
    'Мебель - Мебель для бильярдной',
    'Мебель - Мебель для боулинга',
    'Мебель - Мебель для ночного клуба',
    'Мебель - Мебель для казино',
    'Мебель - Мебель для']

export const ProfileScreen = () => {
    const { removeToken } = useAuthData()
    // const navigate = useNavigate()

    const handleLogout = () => {
        removeToken();
    };

    return (
        <div className="flex flex-col">
            <ProfileHeader name="Gaidar Timirbaev" phone="+998 99 999 99 99" city="Tashkent" />
            <CategoriesList categories={categories} />
            <StatisticsCard
                date="01.01.2025"
                applications={1000}
                totalEarned={300000}
                commission={88000}
                earned={212000}
                onDateChange={(date) => {
                    if (date) {
                        const formattedDate = date.toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })
                        console.log('Selected date:', formattedDate)
                    } else {
                        console.log('Date selection cleared')
                    }
                }}
            />
            <Button label="Выйти" variant="red" onClick={handleLogout} className="mt-8" />
        </div>
    )
}
