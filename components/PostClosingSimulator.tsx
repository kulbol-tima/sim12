'use client';

import { useState, useEffect } from 'react';

interface Property {
  address: string;
  initialValue: number;
  currentValue: number;
  loanBalance: number;
  monthlyPayment: number;
  dealType: 'subject-to' | 'wrap-around' | 'lease-option' | 'seller-financing';
  purchaseDate: Date;
  monthsOwned: number;
}

interface Payment {
  month: number;
  amount: number;
  received: boolean;
  daysLate: number;
  penalty: number;
}

interface RefinancingOffer {
  lender: string;
  loanAmount: number;
  interestRate: number;
  monthlyPayment: number;
  cashOut: number;
  closingCosts: number;
  appraisedValue: number;
}

interface SaleOption {
  type: 'investor' | 'tenant-buyer' | 'market';
  buyer: string;
  offerPrice: number;
  terms: string;
  netProfit: number;
  timeframe: string;
}

export default function PostClosingSimulator() {
  const [currentProperty, setCurrentProperty] = useState<Property>({
    address: '1245 Elm Street, Austin, TX 78704',
    initialValue: 350000,
    currentValue: 365000,
    loanBalance: 310000,
    monthlyPayment: 2700,
    dealType: 'wrap-around',
    purchaseDate: new Date('2024-01-15'),
    monthsOwned: 8
  });

  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentMonth, setCurrentMonth] = useState(8);
  const [showRefinancing, setShowRefinancing] = useState(false);
  const [showSaleOptions, setShowSaleOptions] = useState(false);
  const [buyerStatus, setBuyerStatus] = useState<'current' | 'defaulted' | 'completed'>('current');
  const [defaultMonth, setDefaultMonth] = useState<number | null>(null);
  const [simulationSpeed, setSimulationSpeed] = useState<'normal' | 'fast'>('normal');
  const [activeTab, setActiveTab] = useState<'payments' | 'equity' | 'refinancing' | 'exit'>('payments');

  useEffect(() => {
    generatePaymentHistory();
  }, [currentMonth]);

  const generatePaymentHistory = () => {
    const paymentHistory: Payment[] = [];
    const defaultPoint = Math.random() < 0.15 ? Math.floor(Math.random() * currentMonth) + 4 : null;
    
    for (let month = 1; month <= currentMonth; month++) {
      const isDefault = defaultPoint && month >= defaultPoint;
      const daysLate = isDefault ? Math.floor(Math.random() * 30) + 5 : 0;
      
      paymentHistory.push({
        month,
        amount: currentProperty.monthlyPayment,
        received: !isDefault,
        daysLate,
        penalty: daysLate > 0 ? Math.floor(daysLate * 50) : 0
      });
    }
    
    setPayments(paymentHistory);
    
    if (defaultPoint && defaultPoint <= currentMonth) {
      setBuyerStatus('defaulted');
      setDefaultMonth(defaultPoint);
    }
  };

  const advanceMonth = () => {
    const newMonth = currentMonth + 1;
    setCurrentMonth(newMonth);
    
    // Market appreciation (3-5% annually)
    const monthlyAppreciation = (Math.random() * 0.002 + 0.0025);
    const newValue = Math.round(currentProperty.currentValue * (1 + monthlyAppreciation));
    
    // Loan paydown
    const monthlyRate = 0.065 / 12;
    const interestPayment = currentProperty.loanBalance * monthlyRate;
    const principalPayment = 2100 - interestPayment; // Underlying mortgage payment
    const newLoanBalance = Math.max(0, currentProperty.loanBalance - principalPayment);
    
    setCurrentProperty(prev => ({
      ...prev,
      currentValue: newValue,
      loanBalance: newLoanBalance,
      monthsOwned: newMonth
    }));
  };

  const triggerDefault = () => {
    setBuyerStatus('defaulted');
    setDefaultMonth(currentMonth);
    
    const updatedPayments = payments.map(payment => 
      payment.month >= currentMonth ? { ...payment, received: false, daysLate: 30 } : payment
    );
    setPayments(updatedPayments);
  };

  const initiateRefinancing = () => {
    setShowRefinancing(true);
  };

  const getRefinancingOffers = (): RefinancingOffer[] => {
    const appraisedValue = Math.round(currentProperty.currentValue * (0.95 + Math.random() * 0.1));
    
    return [
      {
        lender: 'Wells Fargo',
        loanAmount: Math.round(appraisedValue * 0.80),
        interestRate: 7.25,
        monthlyPayment: Math.round(appraisedValue * 0.80 * 0.0075),
        cashOut: Math.round(appraisedValue * 0.80 - currentProperty.loanBalance),
        closingCosts: 8500,
        appraisedValue
      },
      {
        lender: 'Bank of America',
        loanAmount: Math.round(appraisedValue * 0.75),
        interestRate: 6.95,
        monthlyPayment: Math.round(appraisedValue * 0.75 * 0.0072),
        cashOut: Math.round(appraisedValue * 0.75 - currentProperty.loanBalance),
        closingCosts: 7200,
        appraisedValue
      },
      {
        lender: 'Local Credit Union',
        loanAmount: Math.round(appraisedValue * 0.78),
        interestRate: 6.85,
        monthlyPayment: Math.round(appraisedValue * 0.78 * 0.0070),
        cashOut: Math.round(appraisedValue * 0.78 - currentProperty.loanBalance),
        closingCosts: 6800,
        appraisedValue
      }
    ];
  };

  const getSaleOptions = (): SaleOption[] => {
    const currentEquity = currentProperty.currentValue - currentProperty.loanBalance;
    const totalCashFlow = payments.filter(p => p.received).reduce((sum, p) => sum + p.amount, 0);
    const totalInvestment = 15000; // Initial investment
    
    return [
      {
        type: 'investor',
        buyer: 'Local Real Estate Investor',
        offerPrice: Math.round(currentProperty.currentValue * 0.85),
        terms: 'Быстрое закрытие, наличные',
        netProfit: Math.round(currentProperty.currentValue * 0.85 - currentProperty.loanBalance + totalCashFlow - totalInvestment),
        timeframe: '15-30 дней'
      },
      {
        type: 'tenant-buyer',
        buyer: 'Текущий арендатор (Lease Option)',
        offerPrice: Math.round(currentProperty.currentValue * 1.05),
        terms: 'Исполнение опциона, финансирование покупателя',
        netProfit: Math.round(currentProperty.currentValue * 1.05 - currentProperty.loanBalance + totalCashFlow - totalInvestment),
        timeframe: '30-45 дней'
      },
      {
        type: 'market',
        buyer: 'Рыночная продажа через риелтора',
        offerPrice: Math.round(currentProperty.currentValue),
        terms: 'Комиссия риелтора 6%, обычное финансирование',
        netProfit: Math.round(currentProperty.currentValue * 0.94 - currentProperty.loanBalance + totalCashFlow - totalInvestment),
        timeframe: '60-90 дней'
      }
    ];
  };

  const restartDeal = () => {
    setBuyerStatus('current');
    setDefaultMonth(null);
    setCurrentMonth(currentMonth + 1);
    
    // Reset property with new tenant
    setCurrentProperty(prev => ({
      ...prev,
      monthlyPayment: prev.monthlyPayment + 100, // Increase rent
      monthsOwned: prev.monthsOwned + 1
    }));
  };

  const calculateTotalReturn = () => {
    const initialInvestment = 15000;
    const totalCashFlow = payments.filter(p => p.received).reduce((sum, p) => sum + p.amount, 0);
    const currentEquity = currentProperty.currentValue - currentProperty.loanBalance;
    const totalReturn = totalCashFlow + currentEquity - initialInvestment;
    const monthlyROI = totalReturn / initialInvestment / currentProperty.monthsOwned * 12 * 100;
    
    return {
      initialInvestment,
      totalCashFlow,
      currentEquity,
      totalReturn,
      monthlyROI: isFinite(monthlyROI) ? monthlyROI : 0
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const returns = calculateTotalReturn();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl">
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-8 rounded-t-2xl">
          <h1 className="text-3xl font-bold mb-2">Симулятор пост-закрытия</h1>
          <p className="text-green-100">Управление недвижимостью после завершения сделки</p>
        </div>

        <div className="p-8">
          {/* Property Status Header */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-blue-700 mb-2">Текущая стоимость</h3>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(currentProperty.currentValue)}</p>
              <p className="text-xs text-blue-600 mt-1">
                +{formatCurrency(currentProperty.currentValue - currentProperty.initialValue)} с покупки
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-purple-700 mb-2">Остаток по кредиту</h3>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(currentProperty.loanBalance)}</p>
              <p className="text-xs text-purple-600 mt-1">
                Equity: {formatCurrency(currentProperty.currentValue - currentProperty.loanBalance)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-green-700 mb-2">Месячный доход</h3>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(currentProperty.monthlyPayment)}</p>
              <p className="text-xs text-green-600 mt-1">
                Прибыль: {formatCurrency(currentProperty.monthlyPayment - 2100)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-orange-700 mb-2">Месяцев владения</h3>
              <p className="text-2xl font-bold text-orange-900">{currentProperty.monthsOwned}</p>
              <p className="text-xs text-orange-600 mt-1">
                Статус: {buyerStatus === 'current' ? 'Платит' : buyerStatus === 'defaulted' ? 'Дефолт' : 'Завершено'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'payments', label: 'Платежи', icon: 'ri-money-dollar-circle-line' },
              { id: 'equity', label: 'Рост Equity', icon: 'ri-arrow-up-line' },
              { id: 'refinancing', label: 'Рефинансирование', icon: 'ri-bank-line' },
              { id: 'exit', label: 'Выход из сделки', icon: 'ri-logout-circle-line' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <i className={tab.icon}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Sections */}
          {activeTab === 'payments' && (
            <div className="space-y-8">
              {/* Payment History */}
              <div className="bg-white border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">История платежей</h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={advanceMonth}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-2"
                    >
                      <i className="ri-skip-forward-line"></i>
                      <span>Следующий месяц</span>
                    </button>
                    {buyerStatus === 'current' && (
                      <button
                        onClick={triggerDefault}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-2"
                      >
                        <i className="ri-alarm-warning-line"></i>
                        <span>Симулировать дефолт</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Месяц</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Опоздание</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Штраф</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {payments.slice(-12).map((payment, index) => (
                        <tr key={index} className={payment.received ? 'bg-white' : 'bg-red-50'}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {payment.month}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              payment.received 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {payment.received ? 'Получен' : 'Не получен'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {payment.daysLate > 0 ? `${payment.daysLate} дней` : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-red-600">
                            {payment.penalty > 0 ? formatCurrency(payment.penalty) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Default Management */}
              {buyerStatus === 'defaulted' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <i className="ri-alarm-warning-line text-red-600 text-xl"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-900 mb-2">
                        Дефолт покупателя - Месяц {defaultMonth}
                      </h3>
                      <p className="text-red-700 mb-4">
                        Покупатель прекратил платежи. Согласно условиям договора, все внесенные им средства остаются у вас, а право собственности возвращается.
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Ваши действия:</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Начать процедуру возврата собственности</li>
                            <li>• Оценить необходимость ремонта</li>
                            <li>• Найти нового покупателя/арендатора</li>
                          </ul>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Последствия для покупателя:</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Потеря всех внесенных средств</li>
                            <li>• Потеря права собственности</li>
                            <li>• Возможные судебные расходы</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <button
                          onClick={restartDeal}
                          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-2"
                        >
                          <i className="ri-restart-line"></i>
                          <span>Найти нового покупателя</span>
                        </button>
                        <button
                          onClick={() => setShowSaleOptions(true)}
                          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-2"
                        >
                          <i className="ri-auction-line"></i>
                          <span>Продать недвижимость</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Summary */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-4">Финансовые итоги</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-green-700 mb-1">Начальные инвестиции:</p>
                    <p className="text-xl font-bold text-green-900">{formatCurrency(returns.initialInvestment)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 mb-1">Общий Cash Flow:</p>
                    <p className="text-xl font-bold text-green-900">{formatCurrency(returns.totalCashFlow)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 mb-1">Текущая Equity:</p>
                    <p className="text-xl font-bold text-green-900">{formatCurrency(returns.currentEquity)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 mb-1">Годовая доходность:</p>
                    <p className="text-xl font-bold text-green-900">{returns.monthlyROI.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'equity' && (
            <div className="space-y-8">
              {/* Equity Growth Chart */}
              <div className="bg-white border rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Автоматический рост Equity</h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Market Appreciation */}
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="ri-line-chart-line text-blue-600"></i>
                      </div>
                      <h4 className="font-semibold text-blue-900">Market Appreciation</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Покупная цена:</span>
                        <span className="font-medium">{formatCurrency(currentProperty.initialValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Текущая оценка:</span>
                        <span className="font-medium">{formatCurrency(currentProperty.currentValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Рост стоимости:</span>
                        <span className="font-bold text-green-600">
                          +{formatCurrency(currentProperty.currentValue - currentProperty.initialValue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Процент роста:</span>
                        <span className="font-bold text-green-600">
                          {(((currentProperty.currentValue / currentProperty.initialValue) - 1) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Loan Paydown */}
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <i className="ri-arrow-down-line text-purple-600"></i>
                      </div>
                      <h4 className="font-semibold text-purple-900">Loan Pay Down</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-purple-700">Начальный долг:</span>
                        <span className="font-medium">{formatCurrency(315000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Текущий остаток:</span>
                        <span className="font-medium">{formatCurrency(currentProperty.loanBalance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Погашено:</span>
                        <span className="font-bold text-green-600">
                          +{formatCurrency(315000 - currentProperty.loanBalance)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Месячное погашение:</span>
                        <span className="font-medium">~{formatCurrency(1200)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Equity Growth */}
                <div className="mt-6 bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-4">Общий рост Equity</h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-green-700 mb-1">Рост стоимости:</p>
                      <p className="text-lg font-bold text-green-900">
                        +{formatCurrency(currentProperty.currentValue - currentProperty.initialValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700 mb-1">Погашение кредита:</p>
                      <p className="text-lg font-bold text-green-900">
                        +{formatCurrency(315000 - currentProperty.loanBalance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700 mb-1">Общий рост Equity:</p>
                      <p className="text-xl font-bold text-green-900">
                        +{formatCurrency((currentProperty.currentValue - currentProperty.initialValue) + (315000 - currentProperty.loanBalance))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Projection */}
              <div className="bg-white border rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Прогноз на будущее</h3>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {[1, 3, 5].map(years => {
                    const futureValue = Math.round(currentProperty.currentValue * Math.pow(1.04, years));
                    const futureLoanBalance = Math.max(0, currentProperty.loanBalance - (1200 * 12 * years));
                    const futureEquity = futureValue - futureLoanBalance;
                    
                    return (
                      <div key={years} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Через {years} {years === 1 ? 'год' : 'года'}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Стоимость:</span>
                            <span className="font-medium">{formatCurrency(futureValue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Остаток кредита:</span>
                            <span className="font-medium">{formatCurrency(futureLoanBalance)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-gray-600">Equity:</span>
                            <span className="font-bold text-green-600">{formatCurrency(futureEquity)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'refinancing' && (
            <div className="space-y-8">
              {/* Refinancing Introduction */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="ri-bank-line text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Рефинансирование для Cash Out</h3>
                    <p className="text-blue-700 mb-4">
                      Используйте накопленную equity для получения наличности. Это позволит инвестировать в новые объекты, сохраняя текущий.
                    </p>
                    <button
                      onClick={() => setShowRefinancing(true)}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-2"
                    >
                      <i className="ri-search-line"></i>
                      <span>Найти предложения рефинансирования</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Refinancing Offers */}
              {showRefinancing && (
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Предложения по рефинансированию</h3>
                  
                  <div className="space-y-6">
                    {getRefinancingOffers().map((offer, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">{offer.lender}</h4>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Cash Out</p>
                            <p className="text-xl font-bold text-green-600">{formatCurrency(offer.cashOut)}</p>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Сумма кредита:</p>
                            <p className="font-semibold">{formatCurrency(offer.loanAmount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Процентная ставка:</p>
                            <p className="font-semibold">{offer.interestRate}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Новый платеж:</p>
                            <p className="font-semibold">{formatCurrency(offer.monthlyPayment)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Расходы закрытия:</p>
                            <p className="font-semibold">{formatCurrency(offer.closingCosts)}</p>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h5 className="font-medium text-gray-900 mb-2">Детали сделки:</h5>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Оценочная стоимость: {formatCurrency(offer.appraisedValue)}</p>
                              <p className="text-gray-600">LTV: {((offer.loanAmount / offer.appraisedValue) * 100).toFixed(0)}%</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Чистые средства: {formatCurrency(offer.cashOut - offer.closingCosts)}</p>
                              <p className="text-gray-600">Изменение платежа: {formatCurrency(offer.monthlyPayment - currentProperty.monthlyPayment)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            Время обработки: 30-45 дней
                          </div>
                          <button className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer">
                            Выбрать это предложение
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits of Refinancing */}
              <div className="bg-white border rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Преимущества cash-out рефинансирования</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Возможности использования средств:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center space-x-2">
                        <i className="ri-check-line text-green-600"></i>
                        <span>Покупка следующей недвижимости</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <i className="ri-check-line text-green-600"></i>
                        <span>Улучшение текущего объекта</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <i className="ri-check-line text-green-600"></i>
                        <span>Диверсификация инвестиций</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <i className="ri-check-line text-green-600"></i>
                        <span>Создание резервного фонда</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Стратегические преимущества:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center space-x-2">
                        <i className="ri-check-line text-green-600"></i>
                        <span>Сохранение доходной недвижимости</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <i className="ri-check-line text-green-600"></i>
                        <span>Налоговые вычеты по процентам</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <i className="ri-check-line text-green-600"></i>
                        <span>Масштабирование портфеля</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <i className="ri-check-line text-green-600"></i>
                        <span>Использование кредитного плеча</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exit' && (
            <div className="space-y-8">
              {/* Exit Strategy Header */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="ri-logout-circle-line text-orange-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-orange-900 mb-2">Стратегии выхода из сделки</h3>
                    <p className="text-orange-700 mb-4">
                      Рассмотрите различные варианты продажи недвижимости для максимизации прибыли и оптимизации налогов.
                    </p>
                    <button
                      onClick={() => setShowSaleOptions(true)}
                      className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-2"
                    >
                      <i className="ri-auction-line"></i>
                      <span>Посмотреть варианты продажи</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sale Options */}
              {showSaleOptions && (
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Варианты продажи</h3>
                  
                  <div className="space-y-6">
                    {getSaleOptions().map((option, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              option.type === 'investor' ? 'bg-blue-100' :
                              option.type === 'tenant-buyer' ? 'bg-green-100' : 'bg-purple-100'
                            }`}>
                              <i className={`text-xl ${
                                option.type === 'investor' ? 'ri-user-line text-blue-600' :
                                option.type === 'tenant-buyer' ? 'ri-key-line text-green-600' : 'ri-home-line text-purple-600'
                              }`}></i>
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{option.buyer}</h4>
                              <p className="text-gray-600 mt-1">{option.terms}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Цена предложения</p>
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(option.offerPrice)}</p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Чистая прибыль:</p>
                            <p className={`text-lg font-bold ${option.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(option.netProfit)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Сроки закрытия:</p>
                            <p className="font-semibold text-gray-900">{option.timeframe}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Общая доходность:</p>
                            <p className="font-semibold text-blue-600">
                              {((option.netProfit / returns.initialInvestment) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h5 className="font-medium text-gray-900 mb-2">Детали сделки:</h5>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Погашение кредита: {formatCurrency(currentProperty.loanBalance)}</p>
                              <p className="text-gray-600">Расходы продажи: {formatCurrency(option.offerPrice * (option.type === 'market' ? 0.06 : 0.02))}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Cash Flow получен: {formatCurrency(returns.totalCashFlow)}</p>
                              <p className="text-gray-600">Общий ROI: {((returns.totalCashFlow + option.netProfit) / returns.initialInvestment * 100).toFixed(1)}%</p>
                            </div>
                          </div>
                        </div>

                        {option.type === 'tenant-buyer' && (
                          <div className="bg-green-50 p-4 rounded-lg mb-4">
                            <h5 className="font-medium text-green-900 mb-2">Особенности Lease Option:</h5>
                            <p className="text-sm text-green-700">
                              Покупатель исполняет свой опцион. Все ранее полученные rent credits засчитываются в покупную цену.
                              Это лучший исход для всех сторон сделки.
                            </p>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            {option.type === 'investor' && 'Быстрая продажа, минимум документооборота'}
                            {option.type === 'tenant-buyer' && 'Лучший исход для lease option сделки'}
                            {option.type === 'market' && 'Максимальная цена, но дольше по времени'}
                          </div>
                          <button className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer">
                            Принять предложение
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tax Considerations */}
              <div className="bg-white border rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Налоговые аспекты</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">1031 Exchange (Like-Kind Exchange):</h4>
                    <p className="text-blue-700 text-sm mb-3">
                      Отложите уплату налога на прибыль, обменяв на аналогичную недвижимость в течение 180 дней.
                    </p>
                    <ul className="text-xs text-blue-600 space-y-1">
                      <li>• Идентификация объекта: 45 дней</li>
                      <li>• Завершение сделки: 180 дней</li>
                      <li>• Используйте квалифицированного посредника</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-3">Installment Sale:</h4>
                    <p className="text-purple-700 text-sm mb-3">
                      Растяните налоговую нагрузку на несколько лет, получив часть платежа позже.
                    </p>
                    <ul className="text-xs text-purple-600 space-y-1">
                      <li>• Налоги платятся по мере получения денег</li>
                      <li>• Подходит для seller financing</li>
                      <li>• Снижает налоговую нагрузку в текущем году</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}