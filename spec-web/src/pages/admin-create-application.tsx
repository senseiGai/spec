import { useState, useEffect, ChangeEvent } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import BackArrowIcon from "../shared/assets/icons/back-arrow-icon";
import { Button } from "../shared/ui/button/button";
import { Selector } from "../shared/ui/selector/selector";
import { Input } from "../shared/ui/input/input";
import { Checkbox } from "../shared/ui/checkbox/checkbox";

import BigCalendarIcon from '../shared/assets/icons/big-calendar-icon';

import { useVisibleStore } from "../shared/model/visible-store";
import { useNavigate } from "react-router";

import { useGetCities } from '../entities/cities/api/use-get-cities';
import { useGetCategories } from '../entities/categories/api/use-get-categories';
import { useCreateApplicationStore } from '../entities/application-creation/model/create-application-store';
import { useCreateApplication } from '../entities/application-creation/api/use-create-application';
import { useSelectorStore } from '../shared/model/selector-store';
import { useAuthData } from '../entities/auth-user/api/use-auth-data';
import { inputMask } from '../shared/utils/inputMask';


export const AdminCreateApplication = () => {
    const { data: cities } = useGetCities()
    const { data: categories } = useGetCategories()
    const { isVisible, toggle, open } = useVisibleStore('time')
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedTime, setSelectedTime] = useState('')
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
    const [rawPhone, setRawPhone] = useState<string>("");
    const [commission, setCommission] = useState(0);
    const [isNowChecked, setIsNowChecked] = useState(false);

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { rawValue } = inputMask(e, store.setPhone);
        setRawPhone(rawValue || "");
    };

    const formatDateToRussian = (date: Date) => {
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const handleNowCheck = () => {
        if (!isNowChecked) {
            const now = new Date();
            const formattedTime = now.toTimeString().slice(0, 5);

            setSelectedDate(now);
            setSelectedTime(formattedTime);
            updateDateTime(now, formattedTime);
        } else {
            setSelectedDate(null);
            setSelectedTime("");
        }
        setIsNowChecked(!isNowChecked);
    };

    const updateDateTime = (date: Date | null, time: string) => {
        if (date && time) {
            const [hours, minutes] = time.split(':').map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) {
                const localDate = new Date(date);
                localDate.setHours(hours, minutes, 0, 0);

                const formattedDate = `${localDate.getFullYear()}-${(localDate.getMonth() + 1).toString().padStart(2, '0')}-${localDate.getDate().toString().padStart(2, '0')}T${localDate.getHours().toString().padStart(2, '0')}:${localDate.getMinutes().toString().padStart(2, '0')}`;

                console.log("📌 Корректное время (UTC+6, без конвертации в UTC):", formattedDate);
                store.setDate(formattedDate);
            }
        }
    };

    const { userId } = useAuthData()
    const { mutate } = useCreateApplication()
    const { selected: cityId } = useSelectorStore('citiesSelector');
    const { selected: categoryId, selectedName: title } = useSelectorStore('categoriesSelector');
    const store = useCreateApplicationStore();

    useEffect(() => {
        open()
    }, [])


    const navigate = useNavigate()

    const validateForm = () => {
        if (!cityId || !cities) {
            alert('Пожалуйста, выберите город')
            return false
        }
        if (!categoryId || !title) {
            alert('Пожалуйста, выберите категорию')
            return false
        }
        if (!store.address) {
            alert('Пожалуйста, укажите адрес')
            return false
        }
        if (!store.description) {
            alert('Пожалуйста, добавьте описание')
            return false
        }
        if (!rawPhone) {
            alert('Пожалуйста, укажите номер телефона')
            return false
        }
        if (!store.priceMin || !store.priceMax) {
            alert('Пожалуйста, укажите минимальную и максимальную цену')
            return false
        }
        if (store.priceMin > store.priceMax) {
            alert('Минимальная цена не может быть больше максимальной')
            return false
        }
        return true
    }

    const calculateCommission = (min: number, max: number) => {
        if (min > 5000 && max < 7000) return 1000;
        if (min > 7000 && max < 10000) return 2000;
        if (min > 10000 && max < 30000) return 3000;
        if (min > 30000 && max < 50000) return 5000;
        return max * 0.1;
    };

    useEffect(() => {
        if (store.priceMin && store.priceMax) {
            setCommission(calculateCommission(store.priceMin, store.priceMax));
        }
    }, [store.priceMin, store.priceMax]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        const phoneWithPlus = `+${rawPhone}`;
        console.log('Form data:', {
            city_id: cityId,
            category_id: categoryId,
            title,
            address: store.address,
            phone: phoneWithPlus,
            emergency: store.emergency
        })

        mutate({
            city_id: cityId,
            category_id: categoryId,
            address: store.address,
            city_area: 'Центр',
            execute_at: store.date,
            title: title,
            description: store.description,
            price_min: store.priceMin,
            price_max: store.priceMax,
            commission: commission,
            phone: phoneWithPlus,
            status_id: 1,
            creator_user_id: userId,
            performer_user_id: userId,
            emergency_call: store.emergency
        }, {
            onSuccess: (data: any) => {
                console.log('Заявка успешно создана:', data)
                alert('Заявка успешно создана')
                navigate('/admin/applications')
            },
            onError: (error) => {
                console.error('Ошибка при создании заявки:', error)
                alert('Не удалось создать заявку. Пожалуйста, проверьте введенные данные и попробуйте снова')
            }
        })
    }


    return (
        <form className="flex flex-col" onSubmit={handleSubmit}>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation()
                    navigate(-1)
                }}
                className="bg-[#F5F5F5] w-10 h-10 rounded-[8px] absolute left-4 top-10 flex items-center justify-center"
            >
                <BackArrowIcon />
            </button>
            <div className="mt-16 h-full">
                <div className="flex flex-col gap-y-1">
                    <Selector
                        isIcon={false}
                        label="Город"
                        options={cities}
                        storeKey="citiesSelector"
                    />
                </div>
                <Input placeholder="Адрес" baseStyle="applicationStyle" className="mt-2" value={store.address} onChange={(e) => store.setAddress(e.target.value)} />
                <Selector isIcon={false} label="Категории" options={categories} storeKey="categoriesSelector" className='mt-2' />
                <textarea
                    className="w-full mt-2 px-4 py-2 border border-[#737373] rounded-[8px] outline-none h-[88px]"
                    placeholder='Описание'
                    value={store.description}
                    onChange={(e) => store.setDescription(e.target.value)}
                />
                <Input variant="phone" baseStyle="applicationStyle" className="mt-2" value={store.phone} onChange={handlePhoneChange} />
                <div className="w-fill justify-between items-center flex mt-4">
                    <span className="text-[#171717] font-[500] text-[18px]">Цена</span>
                    <span className="text-[#171717] font-[500] text-[18px]">Комиссия</span>
                </div>
                <div className="flex flex-row justify-baseline items-center gap-x-2">
                    <Input min={5000} placeholder="Мин." baseStyle="applicationStyle" className="mt-2" value={store.priceMin} onChange={(e) => store.setPriceMin(Number(e.target.value))} />
                    <Input placeholder="Макс." baseStyle="applicationStyle" className="mt-2" value={store.priceMax} onChange={(e) => store.setPriceMax(Number(e.target.value))} />
                    <Input
                        readOnly
                        placeholder={String(commission)}
                        value={commission}
                        baseStyle="applicationStyle"
                        className="mt-2"
                    />
                </div>
                <div className="flex flex-row items-center mt-5 gap-x-2">
                    <Checkbox storeKey="emergency" onClick={(e: any) => {
                        e.stopPropagation()
                        e.preventDefault();
                        store.setEmergency()
                    }} />
                    <span className="text-dark text-[16px] font-[400]">🔥 Аварийный вызов</span>
                </div>
                <span className="mt-4 block text-[#171717] font-[500] text-[18px]">Время</span>
                <div className="mt-3 flex flex-row items-center w-full">
                    <div className="flex flex-row items-center gap-x-2">
                        <Checkbox storeKey="time" onClick={(e: any) => {
                            e.stopPropagation()
                            e.preventDefault();
                            toggle()
                            handleNowCheck()
                        }} />
                        <span className="text-dark text-[16px] font-[400]">Сейчас</span>
                    </div>
                    {isVisible &&
                        <div className="flex flex-row ml-auto gap-x-2 w-[60%]">
                            <div className="w-[55%]">
                                <Input
                                    placeholder="00:00"
                                    baseStyle="applicationStyle"
                                    width="w-full px-3.5"
                                    value={selectedTime}
                                    onChange={(e) => {
                                        let value = e.target.value.replace(/[^0-9]/g, '');
                                        if (value.length > 4) return;
                                        if (value.length > 2) {
                                            value = value.slice(0, 2) + ':' + value.slice(2);
                                        }
                                        const [hours, minutes] = value.split(':').map(Number);
                                        if (hours > 23 || (minutes !== undefined && minutes > 59)) return;
                                        setSelectedTime(value);
                                        if (value.length === 5) {
                                            updateDateTime(selectedDate, value);
                                        }
                                    }}
                                />
                            </div>
                            <div className="w-[65%] relative">
                                <div
                                    className="w-full h-[48px] border border-[#737373] gap-x-1.5 rounded-[8px] px-2 flex items-center justify-between cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setIsDatePickerOpen(!isDatePickerOpen)
                                    }}
                                >
                                    <span className="text-[16px] font-[400]">
                                        {selectedDate ? formatDateToRussian(selectedDate) : 'Дата'}
                                    </span>
                                    <BigCalendarIcon />
                                </div>
                                {isDatePickerOpen && (
                                    <div
                                        className="absolute z-10 top-full right-0 mt-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <DatePicker
                                            selected={selectedDate}
                                            onChange={(date) => {
                                                setSelectedDate(date)
                                                updateDateTime(date, selectedTime)
                                                setIsDatePickerOpen(false)
                                            }}
                                            inline
                                            popperClassName="z-50"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>}
                </div>
            </div>
            <Button variant="default" className="mt-20" label="Создать" type="submit" />
        </form >
    )
}
