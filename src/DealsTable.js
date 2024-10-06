import React, { useEffect, useState } from 'react';
import './DealsTable.css';

const URL = 'https://vlad2mickevichgmailcom.amocrm.ru/api/v4'
const APIDeals = `${URL}/leads`
const token = 'Вставь сюда  access token'

const DealsTable = () => {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeDealId, setActiveDealId] = useState(null)
  const [activeDealDetails, setActiveDealDetails] = useState(null)
  const [page, setPage] = useState(1)
  const [retryPage, setRetryPage] = useState(false)


  const fetchDeals = async (currentPage) => {
    try {
      const response = await fetch(`${APIDeals}?page=${currentPage}&limit=3`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        mode: 'cors',
      })

      if (response.status == 204) {
        console.log('Сделок больше нет')
        setRetryPage(true);
        return
      }
      else {
        const data = await response.json();
        setDeals((prevDeals) => [...prevDeals, ...data._embedded.leads]);
        setRetryPage(false);
        setPage((prevPage) => prevPage + 1)
      }
    } catch (error) {
      console.error('Ошибка при загрузке сделок:', error)
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchDeals(page)
    }, 10000)
    return () => clearInterval(intervalId)
  }, [page, retryPage])

  const fetchDealDetails = async (dealId) => {
    setLoading(true)
    setActiveDealId(dealId)
    const response = await fetch(`${APIDeals}/${dealId}`, {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
      },
      mode: 'cors',
    })

    const dealDetails = await response.json()
    console.log('dealDetails=', dealDetails)
    setLoading(false)
    setActiveDealDetails(dealDetails)
  };

  const handleCardClick = (dealId) => {
    if (dealId === activeDealId) {
      setActiveDealId(null)
      setActiveDealDetails(null)
    } else {
      fetchDealDetails(dealId)
    }
  };

  const renderTaskStatus = (date) => {
    const currentDate = new Date()
    const taskDate = new Date(date * 1000)
    currentDate.setHours(0, 0, 0, 0)
    taskDate.setHours(0, 0, 0, 0)
    const differenceInDays = (taskDate - currentDate) / (1000 * 60 * 60 * 24)

    let color = 'red'

    if (differenceInDays === 0) {
      color = 'green'
    } else if (differenceInDays > 1) {
      color = 'yellow'
    }

    return <svg height="20" width="20">
        <circle cx="10" cy="10" r="8" stroke="black" strokeWidth="1" fill={color} />
    </svg>
  }

  return <div className="deals-table">
      <h1>Сделки</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Бюджет</th>
          </tr>
        </thead>
        <tbody>
          {deals.map(deal =>
            <React.Fragment>
              <tr onClick={() => handleCardClick(deal.id)}>
                <td>{deal.id}</td>
                <td>{deal.name}</td>
                <td>{deal.price}</td>
              </tr>
              {activeDealId === deal.id &&
                 <tr>
                 <td colSpan="3">
                    { loading ? <div>Загрузка...</div> :
                      <div>
                        <p>Название: {activeDealDetails.name}</p>
                        <p>ID: {activeDealDetails.id}</p>
                        <p>Дата: {new Date(activeDealDetails.date).toLocaleDateString('ru-RU')}</p>
                        <div>Статус задачи: {renderTaskStatus(activeDealDetails.closest_task_at)}</div>
                      </div>
                    }
                 </td>
               </tr>
              }
            </React.Fragment>
            )}
        </tbody>
      </table>
    </div>
}

export default DealsTable