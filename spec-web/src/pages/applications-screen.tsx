import { useState } from "react";
import { ApplicationCard } from "../features/application-card/ui/application-card";
import { Popup } from "../widgets/popup/popup";

import { usePopupStore } from "../shared/model/popup-store";
import { useTakenApplicationStore } from "../features/application-card/model/taken-application-store";
import { useGetApplications } from "../entities/application/api/use-get-applications";

import { useChangeStatus } from "../entities/application/api/use-change-status";
import { IChangeStatusRDO } from "../entities/application/api/rdo/change-status.rdo";

export const ApplicationScreen = () => {
    const [refundReason, setRefundReason] = useState<string>("")
    const [denyReason, setDenyReason] = useState<string>("")

    const { mutate } = useChangeStatus()

    const { data: applications, isLoading, error, refetch } = useGetApplications();

    const { isOpen, passedValue, open: openPhonePopup, setPassedValue: setPhoneValue } = usePopupStore("phone-popup");
    const { isOpen: isOpenTaken, open: openTakenPopup } = usePopupStore("taken-popup");
    const { isOpen: isOpenExecution, open: openExecutionPopup, close: closeExecutionPopup } = usePopupStore("execution-popup");
    const { isOpen: isOpenComplete, open: openCompletePopup, close: closeCompletePopup } = usePopupStore("complete-popup");
    const { isOpen: isOpenRefund, open: openRefundPopup, close: closeRefundPopup } = usePopupStore("refund-popup");
    const { isOpen: isOpenReject, open: openRejectPopup, close: closeRejectPopup } = usePopupStore("reject-popup");

    const { setTaken, taken, } = useTakenApplicationStore();
    const [currentCard, setCurrentCard] = useState<number | null>(null);

    if (isLoading) return <p className="text-center">Загрузка заявок...</p>;
    if (error) return <p className="text-red-500 text-center">Ошибка: {error.message}</p>;

    const handleTakeApplication = (index: number, phone: string) => {
        if (taken.includes(index)) return;
        if (taken.length >= 1) {
            openTakenPopup();
            return;
        }
        setPhoneValue(phone);
        openPhonePopup();
        setTaken(index);
    };

    const handleStartExecution = () => {
        if (currentCard !== null && applications) {
            handleChangeStatus(applications[currentCard].id, { status_id: 3 })
            setCurrentCard(null);
            closeExecutionPopup();
        }
    }

    const takenApplication = applications?.[taken[0]];

    const handleChangeStatus = (task_id: number, status: IChangeStatusRDO) => {
        mutate(
            { data: status, task_id },
            {
                onSuccess: () => {
                    console.log("Status successfully updated");
                    refetch();
                },
                onError: (error) => console.error("Error:", error.message)
            }
        );
    }


    const handleRefund = () => {
        if (currentCard !== null && applications) {
            handleChangeStatus(applications[currentCard].id, { status_id: 4, comment: refundReason })
            setCurrentCard(null);
            closeRefundPopup();
        }
    }

    const handleClientDeny = () => {
        if (currentCard !== null && applications) {
            handleChangeStatus(applications[currentCard].id, { status_id: 5, comment: denyReason })
            setCurrentCard(null);
            closeRejectPopup();
        }
    }

    const handleComplete = () => {
        if (currentCard !== null && applications) {
            handleChangeStatus(applications[currentCard].id, { status_id: 6 })
            setCurrentCard(null);
            closeCompletePopup();
        }
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {applications?.map((application: any, index: number) => {
                    return (
                        <ApplicationCard
                            key={index}
                            {...application}
                            index={index}
                            onReject={() => {
                                setCurrentCard(index);
                                openRejectPopup();
                            }}
                            onRefund={() => {
                                setCurrentCard(index);
                                openRefundPopup();
                            }}
                            onClick={() => {
                                setCurrentCard(index);
                                if (application.status_id === 3) {
                                    openCompletePopup();
                                } else if (application.status_id === 2) {
                                    openExecutionPopup();
                                } else if (taken.length >= 1) {
                                    openTakenPopup();
                                } else if (application.status_id === 1) {
                                    handleChangeStatus(application.id, { status_id: 2 })
                                    handleTakeApplication(index, application.phone);
                                }
                            }}
                        />
                    );
                })}
            </div>

            {isOpen && (
                <Popup
                    title="Звонок клиенту"
                    storeKey="phone-popup"
                    actionLabel={passedValue || "Продолжить"}
                    onClick={() => {
                        window.location.href = `tel:${passedValue}`;
                    }}
                />
            )}

            {isOpenExecution && (
                <Popup
                    title="Вы начали исполнять данную заявку?"
                    storeKey="execution-popup"
                    closeLabel="Нет"
                    actionLabel="Да"
                    onClick={handleStartExecution}
                />
            )}

            {isOpenTaken && (
                <Popup
                    isCenter={false}
                    title={`Для взятия следующего заказа, оплатите комиссию за предыдущий заказ по адресу ${takenApplication?.address}`}
                    storeKey="taken-popup"
                    closeLabel="Отмена"
                    actionLabel={takenApplication?.comission || "Продолжить"}
                />
            )}


            {isOpenComplete && (
                <Popup
                    title="Вы выполнили данную заявку?"
                    storeKey="complete-popup"
                    closeLabel="Нет"
                    actionLabel="Да"
                    onClick={() => {
                        if (currentCard !== null) {
                            handleComplete()
                            closeCompletePopup();
                        }
                    }}
                />
            )}

            {isOpenRefund && (
                <Popup
                    isCenter={false}
                    title="Укажите причину возврата заказа"
                    storeKey="refund-popup"
                    closeLabel="Отмена"
                    actionLabel="Отправить"
                    onClick={(reason) => {
                        if (currentCard !== null && reason) {
                            handleRefund()
                            closeRefundPopup();
                        }
                    }}
                    children={
                        <textarea
                            className="w-full px-4 py-3 border border-[#737373] rounded-[8px] mb-4 outline-none h-[88px]"
                            placeholder='Причина возврата'
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                        />
                    }
                    disabled={!refundReason.trim()}
                />
            )}

            {isOpenReject && (
                <Popup
                    isCenter={false}
                    title="Укажите причину отказа клиента"
                    storeKey="reject-popup"
                    closeLabel="Отмена"
                    actionLabel="Отправить"
                    onClick={(reason) => {
                        if (currentCard !== null && reason) {
                            handleClientDeny()
                            closeRejectPopup();
                        }
                    }}
                    children={
                        <textarea
                            className="w-full px-4 py-3 border border-[#737373] rounded-[8px] mb-4 outline-none h-[88px]"
                            placeholder='Причина отказа'
                            value={denyReason}
                            onChange={(e) => setDenyReason(e.target.value)}
                        />
                    }
                    disabled={!denyReason.trim()}
                />
            )}
        </>
    );
};
