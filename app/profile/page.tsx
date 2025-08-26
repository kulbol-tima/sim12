
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Deal {
  id: number;
  property: string;
  type: 'completed' | 'active';
  investment: number;
  currentValue: number;
  monthlyFlow: number;
  roi: number;
  date: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'stats'>('overview');

  // Моковые данные пользователя
  const user = {
    name: 'Александр Иванов',
    email: 'alexander.ivanov@email.com',
    experience: 'intermediate',
    joinDate: '2024-01-15',
    balance: 125000,
    totalDeals: 12,
    successfulDeals: 8,
    sellerMeetings: 23
  };

  const deals: Deal[] = [
    {
      id: 1,
      property: '123 Oak Street, Austin, TX',
      type: 'completed',
      investment: 25000,
      currentValue: 320000,
      monthlyFlow: 1850,
      roi: 8.9,
      date: '2024-02-15'
    },
    {
      id: 2,
      property: '456 Pine Avenue, Dallas, TX',
      type: 'active',
      investment: 35000,
      currentValue: 420000,
      monthlyFlow: 2100,
      roi: 7.2,
      date: '2024-03-01'
    },
    {
      id: 3,
      property: '789 Maple Drive, Houston, TX',
      type: 'completed',
      investment: 30000,
      currentValue: 385000,
      monthlyFlow: 2000,
      roi: 8.0,
      date: '2024-02-28'
    }
  ];

  const totalProfit = deals.reduce((sum, deal) => sum + (deal.currentValue - deal.investment), 0);
  const totalInvestment = deals.reduce((sum, deal) => sum + deal.investment, 0);
  const monthlyIncome = deals.reduce((sum, deal) => sum + deal.monthlyFlow, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="ri-building-line text-white text-xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">US Real Estate Simulator</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/scenario-generator" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap cursor-pointer">
                Новая сделка
              </Link>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer">
                <i className="ri-user-line text-gray-600"></i>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-user-line text-blue-600 text-2xl"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <i className="ri-dashboard-line mr-2"></i>
                  Обзор
                </button>
                <button
                  onClick={() => setActiveTab('deals')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'deals'
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <i className="ri-briefcase-line mr-2"></i>
                  Портфель сделок
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'stats'
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <i className="ri-bar-chart-line mr-2"></i>
                  Статистика
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Balance Card */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-blue-100">Виртуальный баланс</h3>
                      <p className="text-3xl font-bold">${user.balance.toLocaleString()}</p>
                    </div>
                    <div className="w-16 h-16 bg-blue-500/30 rounded-full flex items-center justify-center">
                      <i className="ri-wallet-3-line text-2xl"></i>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Общая прибыль</p>
                        <p className="text-2xl font-bold text-green-600">${totalProfit.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <i className="ri-arrow-up-line text-green-600"></i>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Всего сделок</p>
                        <p className="text-2xl font-bold text-gray-900">{user.totalDeals}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="ri-briefcase-line text-blue-600"></i>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Успешных сделок</p>
                        <p className="text-2xl font-bold text-gray-900">{user.successfulDeals}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <i className="ri-check-line text-purple-600"></i>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Встреч с продавцами</p>
                        <p className="text-2xl font-bold text-gray-900">{user.sellerMeetings}</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <i className="ri-user-voice-line text-orange-600"></i>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Deals */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Недавние сделки</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {deals.slice(0, 3).map((deal) => (
                        <div key={deal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                deal.type === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                              }`}
                            >
                              <i
                                className={`${deal.type === 'completed' ? 'ri-check-line text-green-600' : 'ri-time-line text-blue-600'}`}
                              ></i>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{deal.property}</p>
                              <p className="text-sm text-gray-500">ROI: {deal.roi}% • Cash Flow: ${deal.monthlyFlow}/мес</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">${deal.currentValue.toLocaleString()}</p>
                            <p className="text-sm text-green-600">+${(deal.currentValue - deal.investment).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'deals' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Портфель сделок</h3>
                    <Link href="/scenario-generator" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
                      Новая сделка
                    </Link>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Недвижимость</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Инвестиция</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Текущая стоимость</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cash Flow</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {deals.map((deal) => (
                        <tr key={deal.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{deal.property}</p>
                              <p className="text-sm text-gray-500">{deal.date}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                deal.type === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {deal.type === 'completed' ? 'Завершена' : 'Активна'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">${deal.investment.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">${deal.currentValue.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-green-600">${deal.monthlyFlow}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{deal.roi}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Финансовые показатели</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Общие инвестиции:</span>
                        <span className="font-medium">${totalInvestment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Общая прибыль:</span>
                        <span className="font-medium text-green-600">${totalProfit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Месячный доход:</span>
                        <span className="font-medium">${monthlyIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Средний ROI:</span>
                        <span className="font-medium">{(deals.reduce((sum, deal) => sum + deal.roi, 0) / deals.length).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Опыт и навыки</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Уровень опыта:</span>
                        <span className="font-medium capitalize">
                          {user.experience === 'beginner' && 'Новичок'}
                          {user.experience === 'intermediate' && 'Средний'}
                          {user.experience === 'advanced' && 'Продвинутый'}
                          {user.experience === 'expert' && 'Эксперт'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Встреч с продавцами:</span>
                        <span className="font-medium">{user.sellerMeetings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Успешность сделок:</span>
                        <span className="font-medium">{Math.round((user.successfulDeals / user.totalDeals) * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Дней в симуляторе:</span>
                        <span className="font-medium">{Math.floor((Date.now() - new Date(user.joinDate).getTime()) / (1000 * 60 * 60 * 24))}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Достижения</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gold-100 rounded-full flex items-center justify-center">
                          <i className="ri-medal-line text-yellow-600"></i>
                        </div>
                        <span className="text-sm">Первая сделка</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <i className="ri-trophy-line text-green-600"></i>
                        </div>
                        <span className="text-sm">10 успешных сделок</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <i className="ri-money-dollar-circle-line text-blue-600"></i>
                        </div>
                        <span className="text-sm">ROI больше 10%</span>
                      </div>
                      <div className="flex items-center space-x-3 opacity-50">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <i className="ri-vip-crown-line text-gray-400"></i>
                        </div>
                        <span className="text-sm">Эксперт переговоров</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
