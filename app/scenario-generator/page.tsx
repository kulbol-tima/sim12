
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Scenario {
  id: number;
  type: 'pre-foreclosure' | 'relocation' | 'stuck-listing' | 'low-equity' | 'high-equity';
  title: string;
  property: {
    address: string;
    fmv: number;
    owedAmount: number;
    monthlyPayment: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    yearBuilt: number;
    condition: 'excellent' | 'cosmetic-repair';
    conditionDetails: string;
    propertyTaxes: number;
    repairCosts: number;
    repairCategory: 'minor' | 'major';
    repairDetails: string;
    rentalIncome: number;
  };
  seller: {
    name: string;
    age: number;
    situation: string;
    motivation: string;
    timeframe: string;
    flexibility: 'high' | 'medium' | 'low';
    additionalAssets?: string[];
  };
  financials: {
    equity: number;
    ltv: number;
    loanType: 'conventional' | 'fha' | 'va' | 'other';
    arrearsAmount?: number;
    arrearsMonths?: number;
    taxArrears?: number;
    monthsOnMarket?: number;
    carryingCosts?: number;
    taxesOwed?: number;
  };
}

const scenarioTypes = {
  'pre-foreclosure': {
    name: 'Pre-foreclosure (Предстоящее отчуждение)',
    description: 'Продавец не может платить ипотеку или налоги, грозит потеря дома',
    color: 'red',
    icon: 'ri-alarm-warning-line'
  },
  'relocation': {
    name: 'Переезд/личные обстоятельства',
    description: 'Смена работы, болезнь, семейные обстоятельства требуют быстрой продажи',
    color: 'blue',
    icon: 'ri-truck-line'
  },
  'stuck-listing': {
    name: 'Дом "висит" на продаже',
    description: 'Объект долго не продается, продавец несет двойные платежи',
    color: 'orange',
    icon: 'ri-time-line'
  },
  'low-equity': {
    name: 'Низкая/Отрицательная Equity',
    description: 'Долг близок к стоимости дома или превышает ее',
    color: 'purple',
    icon: 'ri-arrow-down-line'
  },
  'high-equity': {
    name: 'Высокая Equity',
    description: 'Владелец готов рассматривать финансирование от себя',
    color: 'green',
    icon: 'ri-arrow-up-line'
  }
};

const loanTypes = {
  'conventional': 'Conventional 30-year Fixed',
  'fha': 'FHA Loan',
  'va': 'VA Loan',
  'other': 'Other'
};

export default function ScenarioGeneratorPage() {
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [selectedType, setSelectedType] = useState<string>('random');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateScenario = (type?: string) => {
    setIsGenerating(true);

    setTimeout(() => {
      const scenarioType = type === 'random' ? 
        Object.keys(scenarioTypes)[Math.floor(Math.random() * Object.keys(scenarioTypes).length)] :
        type;

      const scenario = createScenario(scenarioType as keyof typeof scenarioTypes);
      setCurrentScenario(scenario);
      setIsGenerating(false);
    }, 1500);
  };

  const createScenario = (type: keyof typeof scenarioTypes): Scenario => {
    const addresses = [
      '1245 Elm Street, Austin, TX 78704',
      '567 Oak Avenue, Dallas, TX 75201',
      '890 Pine Drive, Houston, TX 77001',
      '234 Maple Lane, San Antonio, TX 78201',
      '678 Cedar Court, Fort Worth, TX 76101',
      '912 Birch Boulevard, Plano, TX 75023',
      '345 Willow Way, Arlington, TX 76010'
    ];

    const names = ['Robert Johnson', 'Maria Rodriguez', 'David Wilson', 'Jennifer Brown', 'Michael Davis', 'Sarah Miller', 'James Garcia', 'Lisa Anderson'];

    const baseProperty = {
      address: addresses[Math.floor(Math.random() * addresses.length)],
      bedrooms: Math.floor(Math.random() * 3) + 2, // 2-4 bedrooms
      bathrooms: Math.floor(Math.random() * 2) + 1,
      sqft: Math.floor(Math.random() * 1000) + 1200,
      yearBuilt: Math.floor(Math.random() * 30) + 1990,
      condition: Math.random() > 0.3 ? 'excellent' : 'cosmetic-repair' as 'excellent' | 'cosmetic-repair'
    };

    // Средний ценовой диапазон для разных городов Техаса
    const baseFMV = Math.floor(Math.random() * 150000) + 250000; // $250k-$400k
    const annualTaxes = Math.floor(baseFMV * 0.015); // ~1.5% property tax rate in TX
    const monthlyRent = Math.floor(baseFMV * 0.008); // ~0.8% monthly rent ratio

    const conditionDetails = baseProperty.condition === 'excellent' 
      ? 'Дом в отличном состоянии, готов к заселению'
      : 'Требуется небольшой косметический ремонт';

    const repairCosts = baseProperty.condition === 'excellent' 
      ? Math.floor(Math.random() * 3000) + 1000  // $1k-$4k
      : Math.floor(Math.random() * 8000) + 3000; // $3k-$11k

    const repairCategory: 'minor' | 'major' = repairCosts < 5000 ? 'minor' : 'major';
    
    const repairDetails = repairCategory === 'minor' 
      ? 'Покраска, замена ковров, мелкий ремонт'
      : 'Обновление кухни, ванной, замена напольного покрытия';

    switch (type) {
      case 'pre-foreclosure':
        const preForeclosureLTV = 85 + Math.random() * 15; // 85-100% LTV
        const owedAmount = Math.floor(baseFMV * (preForeclosureLTV / 100));
        const arrearsMonths = Math.floor(Math.random() * 6) + 3; // 3-8 months behind
        const monthlyPayment = Math.floor(owedAmount * 0.006);
        
        return {
          id: Date.now(),
          type,
          title: 'Срочная продажа из-за финансовых трудностей',
          property: {
            ...baseProperty,
            fmv: baseFMV,
            owedAmount,
            monthlyPayment,
            conditionDetails,
            propertyTaxes: annualTaxes,
            repairCosts,
            repairCategory,
            repairDetails,
            rentalIncome: monthlyRent
          },
          seller: {
            name: names[Math.floor(Math.random() * names.length)],
            age: Math.floor(Math.random() * 20) + 35,
            situation: 'Потерял работу 8 месяцев назад, просрочки по ипотеке накапливаются',
            motivation: 'Избежать foreclosure, сохранить кредитную историю',
            timeframe: '30-60 дней до аукциона',
            flexibility: 'high'
          },
          financials: {
            equity: baseFMV - owedAmount,
            ltv: preForeclosureLTV,
            loanType: Math.random() > 0.6 ? 'fha' : 'conventional',
            arrearsAmount: monthlyPayment * arrearsMonths,
            arrearsMonths,
            taxArrears: Math.floor(Math.random() * 5000) + 2000
          }
        };

      case 'relocation':
        const relocationLTV = 60 + Math.random() * 25; // 60-85% LTV
        const relocationOwed = Math.floor(baseFMV * (relocationLTV / 100));
        
        return {
          id: Date.now(),
          type,
          title: 'Срочный переезд по работе',
          property: {
            ...baseProperty,
            fmv: baseFMV,
            owedAmount: relocationOwed,
            monthlyPayment: Math.floor(relocationOwed * 0.005),
            conditionDetails,
            propertyTaxes: annualTaxes,
            repairCosts,
            repairCategory,
            repairDetails,
            rentalIncome: monthlyRent
          },
          seller: {
            name: names[Math.floor(Math.random() * names.length)],
            age: Math.floor(Math.random() * 15) + 30,
            situation: 'Получил повышение в Калифорнии, должен переехать через 8 недель',
            motivation: 'Быстрая продажа для покупки нового дома',
            timeframe: '60-90 дней',
            flexibility: 'high'
          },
          financials: {
            equity: baseFMV - relocationOwed,
            ltv: relocationLTV,
            loanType: 'conventional',
            carryingCosts: Math.floor(relocationOwed * 0.005) + 800
          }
        };

      case 'stuck-listing':
        const stuckLTV = 70 + Math.random() * 20; // 70-90% LTV
        const stuckOwed = Math.floor(baseFMV * (stuckLTV / 100));
        const monthsOnMarket = Math.floor(Math.random() * 8) + 6; // 6-14 months
        
        return {
          id: Date.now(),
          type,
          title: `Дом не продается уже ${monthsOnMarket} месяцев`,
          property: {
            ...baseProperty,
            fmv: baseFMV,
            owedAmount: stuckOwed,
            monthlyPayment: Math.floor(stuckOwed * 0.005),
            conditionDetails,
            propertyTaxes: annualTaxes,
            repairCosts,
            repairCategory,
            repairDetails,
            rentalIncome: monthlyRent
          },
          seller: {
            name: names[Math.floor(Math.random() * names.length)],
            age: Math.floor(Math.random() * 20) + 40,
            situation: 'Уже купил новый дом, платит две ипотеки. Агент по недвижимости снизил цену 3 раза',
            motivation: 'Прекратить нести двойные расходы',
            timeframe: 'Как можно скорее',
            flexibility: 'high'
          },
          financials: {
            equity: baseFMV - stuckOwed,
            ltv: stuckLTV,
            loanType: 'conventional',
            monthsOnMarket,
            carryingCosts: Math.floor(stuckOwed * 0.005) + Math.floor(Math.random() * 1200) + 1800
          }
        };

      case 'low-equity':
        const lowEquityLTV = 95 + Math.random() * 10; // 95-105% LTV (underwater)
        const lowEquityOwed = Math.floor(baseFMV * (lowEquityLTV / 100));
        const additionalAssets = [
          '2018 Ford F-150 ($28,000)',
          'Лодка Sea Ray ($15,000)', 
          'Ювелирные изделия ($8,000)',
          'Мотоцикл Harley ($12,000)'
        ];
        
        return {
          id: Date.now(),
          type,
          title: 'Подводная ипотека (underwater mortgage)',
          property: {
            ...baseProperty,
            fmv: baseFMV,
            owedAmount: lowEquityOwed,
            monthlyPayment: Math.floor(lowEquityOwed * 0.006),
            conditionDetails,
            propertyTaxes: annualTaxes,
            repairCosts,
            repairCategory,
            repairDetails,
            rentalIncome: monthlyRent
          },
          seller: {
            name: names[Math.floor(Math.random() * names.length)],
            age: Math.floor(Math.random() * 15) + 35,
            situation: 'Купил на пике рынка в 2021, цены упали на 15%, нужно переезжать по работе',
            motivation: 'Избежать доплаты $15-25k на закрытии сделки',
            timeframe: '4-6 месяцев',
            flexibility: 'medium',
            additionalAssets: additionalAssets.slice(0, Math.floor(Math.random() * 3) + 1)
          },
          financials: {
            equity: baseFMV - lowEquityOwed,
            ltv: lowEquityLTV,
            loanType: Math.random() > 0.5 ? 'conventional' : 'fha'
          }
        };

      case 'high-equity':
        const highEquityLTV = 10 + Math.random() * 35; // 10-45% LTV
        const highEquityOwed = Math.floor(baseFMV * (highEquityLTV / 100));
        
        return {
          id: Date.now(),
          type,
          title: 'Пожилой владелец с большой equity',
          property: {
            ...baseProperty,
            fmv: baseFMV,
            owedAmount: highEquityOwed,
            monthlyPayment: highEquityOwed > 0 ? Math.floor(Math.random() * 800) + 400 : 0,
            conditionDetails,
            propertyTaxes: annualTaxes,
            repairCosts,
            repairCategory,
            repairDetails,
            rentalIncome: monthlyRent
          },
          seller: {
            name: names[Math.floor(Math.random() * names.length)],
            age: Math.floor(Math.random() * 15) + 65,
            situation: 'Переезжает в дом престарелых, не нуждается во всей сумме сразу, заинтересован в стабильном доходе',
            motivation: 'Получать ежемесячные выплаты вместо единовременной суммы',
            timeframe: 'Гибкий график, до 6 месяцев',
            flexibility: 'medium'
          },
          financials: {
            equity: baseFMV - highEquityOwed,
            ltv: highEquityLTV,
            loanType: highEquityOwed > 0 ? 'conventional' : 'other'
          }
        };

      default:
        return createScenario('pre-foreclosure');
    }
  };

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
              <Link href="/deal-structure" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium whitespace-nowrap cursor-pointer">
                Структура сделок
              </Link>
              <Link href="/profile" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium whitespace-nowrap cursor-pointer">
                Профиль
              </Link>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer">
                <i className="ri-user-line text-gray-600"></i>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Генератор сценариев сделок</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Для успешной креативной сделки нужен <strong>мотивированный продавец</strong>. 
            Изучайте различные ситуации и учитесь находить win-win решения.
          </p>
        </div>

        {/* Axiom Banner */}
        <div className="bg-blue-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center">
              <i className="ri-lightbulb-line text-2xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Аксиома #1</h3>
              <p className="text-blue-100">Для хорошей креативной сделки нужен мотивированный продавец</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Generator Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Выберите тип сценария</h3>
              
              <div className="space-y-3 mb-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="scenarioType"
                    value="random"
                    checked={selectedType === 'random'}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Случайный сценарий</span>
                </label>
                
                {Object.entries(scenarioTypes).map(([key, type]) => (
                  <label key={key} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="scenarioType"
                      value={key}
                      checked={selectedType === key}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <i className={`${type.icon} text-${type.color}-600`}></i>
                        <span className="font-medium text-gray-900 text-sm">{type.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              <button
                onClick={() => generateScenario(selectedType)}
                disabled={isGenerating}
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors whitespace-nowrap cursor-pointer"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Генерирую...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <i className="ri-refresh-line"></i>
                    <span>Сгенерировать сценарий</span>
                  </div>
                )}
              </button>

              {currentScenario && (
                <Link 
                  href={`/negotiation?scenario=${currentScenario.id}`}
                  className="w-full mt-4 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center space-x-2"
                >
                  <i className="ri-chat-3-line"></i>
                  <span>Начать переговоры</span>
                </Link>
              )}
            </div>
          </div>

          {/* Right Panel - Generated Scenario */}
          <div className="lg:col-span-2">
            {!currentScenario ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-file-list-3-line text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Выберите тип сценария</h3>
                <p className="text-gray-500">Нажмите "Сгенерировать сценарий" чтобы создать новую ситуацию для отработки навыков</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Scenario Header */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-10 h-10 bg-${scenarioTypes[currentScenario.type].color}-100 rounded-lg flex items-center justify-center`}>
                          <i className={`${scenarioTypes[currentScenario.type].icon} text-${scenarioTypes[currentScenario.type].color}-600`}></i>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{currentScenario.title}</h2>
                          <p className="text-sm text-gray-500">{scenarioTypes[currentScenario.type].name}</p>
                        </div>
                      </div>
                      <p className="text-gray-600">{scenarioTypes[currentScenario.type].description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${scenarioTypes[currentScenario.type].color}-100 text-${scenarioTypes[currentScenario.type].color}-800`}>
                      Мотивация: {currentScenario.seller.flexibility === 'high' ? 'Высокая' : currentScenario.seller.flexibility === 'medium' ? 'Средняя' : 'Низкая'}
                    </span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Информация о недвижимости</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Основные данные</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Адрес:</span>
                          <span className="font-medium text-right">{currentScenario.property.address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">FMV (Fair Market Value):</span>
                          <span className="font-medium">${currentScenario.property.fmv.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Остаток по ипотеке:</span>
                          <span className="font-medium">${currentScenario.property.owedAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Тип займа:</span>
                          <span className="font-medium">{loanTypes[currentScenario.financials.loanType]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">LTV (Loan to Value):</span>
                          <span className={`font-medium ${currentScenario.financials.ltv > 95 ? 'text-red-600' : currentScenario.financials.ltv > 85 ? 'text-orange-600' : 'text-green-600'}`}>
                            {currentScenario.financials.ltv.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ежемесячный платеж:</span>
                          <span className="font-medium">${currentScenario.property.monthlyPayment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Equity (собственность):</span>
                          <span className={`font-medium ${currentScenario.financials.equity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${currentScenario.financials.equity.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Характеристики</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Спальни:</span>
                          <span className="font-medium">{currentScenario.property.bedrooms}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ванные:</span>
                          <span className="font-medium">{currentScenario.property.bathrooms}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Площадь:</span>
                          <span className="font-medium">{currentScenario.property.sqft.toLocaleString()} кв.фт</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Год постройки:</span>
                          <span className="font-medium">{currentScenario.property.yearBuilt}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Состояние:</span>
                          <span className={`font-medium ${currentScenario.property.condition === 'excellent' ? 'text-green-600' : 'text-orange-600'}`}>
                            {currentScenario.property.conditionDetails}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Налоги в год:</span>
                          <span className="font-medium">${currentScenario.property.propertyTaxes.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Финансовые параметры</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Ремонт и доходность</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Стоимость ремонта:</span>
                          <span className={`font-medium ${currentScenario.property.repairCategory === 'minor' ? 'text-green-600' : 'text-orange-600'}`}>
                            ${currentScenario.property.repairCosts.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Тип ремонта:</span>
                          <span className="font-medium">
                            {currentScenario.property.repairCategory === 'minor' ? 'Небольшой' : 'Серьезный'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600 block mb-1">Описание работ:</span>
                          <p className="text-gray-900 text-sm">{currentScenario.property.repairDetails}</p>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Рыночная аренда:</span>
                          <span className="font-medium text-green-600">${currentScenario.property.rentalIncome.toLocaleString()}/мес</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Финансовое состояние</h4>
                      <div className="space-y-2 text-sm">
                        {currentScenario.financials.arrearsAmount && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Просрочка по ипотеке:</span>
                              <span className="font-medium text-red-600">${currentScenario.financials.arrearsAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Месяцев просрочки:</span>
                              <span className="font-medium text-red-600">{currentScenario.financials.arrearsMonths}</span>
                            </div>
                          </>
                        )}
                        {currentScenario.financials.taxArrears && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Долг по налогам:</span>
                            <span className="font-medium text-red-600">${currentScenario.financials.taxArrears.toLocaleString()}</span>
                          </div>
                        )}
                        {currentScenario.financials.carryingCosts && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Расходы на содержание:</span>
                            <span className="font-medium text-red-600">${currentScenario.financials.carryingCosts.toLocaleString()}/мес</span>
                          </div>
                        )}
                        {currentScenario.financials.monthsOnMarket && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Месяцев на продаже:</span>
                            <span className="font-medium text-orange-600">{currentScenario.financials.monthsOnMarket}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seller Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Профиль продавца</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Личная информация</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Имя:</span>
                          <span className="font-medium">{currentScenario.seller.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Возраст:</span>
                          <span className="font-medium">{currentScenario.seller.age} лет</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Временные рамки:</span>
                          <span className="font-medium">{currentScenario.seller.timeframe}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Гибкость в переговорах:</span>
                          <span className={`font-medium ${currentScenario.seller.flexibility === 'high' ? 'text-green-600' : currentScenario.seller.flexibility === 'medium' ? 'text-yellow-600' : 'text-red-600'}`}>
                            {currentScenario.seller.flexibility === 'high' ? 'Высокая' : currentScenario.seller.flexibility === 'medium' ? 'Средняя' : 'Низкая'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Мотивация</h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-gray-600 block mb-1">Ситуация:</span>
                          <p className="text-gray-900">{currentScenario.seller.situation}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 block mb-1">Основная мотивация:</span>
                          <p className="text-gray-900 font-medium">{currentScenario.seller.motivation}</p>
                        </div>
                        {currentScenario.seller.additionalAssets && (
                          <div>
                            <span className="text-gray-600 block mb-1">Дополнительные активы:</span>
                            <ul className="text-gray-900 list-disc list-inside">
                              {currentScenario.seller.additionalAssets.map((asset, index) => (
                                <li key={index} className="text-xs">{asset}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Link 
                    href={`/negotiation?scenario=${currentScenario.id}`}
                    className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <i className="ri-chat-3-line"></i>
                    <span>Начать переговоры с продавцом</span>
                  </Link>
                  <Link 
                    href={`/deal-structure?scenario=${currentScenario.id}`}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <i className="ri-file-settings-line"></i>
                    <span>Структурировать сделку</span>
                  </Link>
                  <button
                    onClick={() => generateScenario(selectedType)}
                    className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-2"
                  >
                    <i className="ri-refresh-line"></i>
                    <span>Новый сценарий</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
