
'use client';

import { useState, useEffect } from 'react';
import PostClosingSimulator from './PostClosingSimulator';

interface FinancialData {
  propertyValue: number;
  existingMortgage: number;
  downPayment: number;
  sellerFinancing: number;
  monthlyRent: number;
  repairCosts: number;
  closingCosts: number;
  monthlyHolding: number;
  agentCommission: number;
  lateFees: number;
  doublePayments: number;
  dealType: string;
  purchasePrice: number;
  marketAppreciationRate: number;
  timeHorizonYears: number;
  interestRate: number;
  buyerDownPayments?: number;
  wrapAroundPayment?: number;
  optionPremium?: number;
  assignmentFee?: number;
  assetTradeValue?: number;
}

interface CalculatedMetrics {
  ltv: number;
  equity: number;
  monthlyCashflow: number;
  annualCashflow: number;
  totalInvestment: number;
  roi: number;
  totalExpenses: number;
  netProfit: number;
}

interface DISREETCalculation {
  discount: number;
  rentCashflow: number;
  marketAppreciation: number;
  loanPaydown: number;
  taxDepreciation: number;
  totalProfit: number;
  annualizedReturn: number;
}

interface DebtAnalysis {
  totalDebt: number;
  goodDebt: number;
  badDebt: number;
  debtServiceCoverage: number;
  classification: 'excellent' | 'good' | 'acceptable' | 'poor';
  reasoning: string[];
}

export default function FinancialCalculator() {
  const [data, setData] = useState<FinancialData>({
    propertyValue: 300000,
    existingMortgage: 250000,
    downPayment: 10,
    sellerFinancing: 0,
    monthlyRent: 2500,
    repairCosts: 5000,
    closingCosts: 3000,
    monthlyHolding: 800,
    agentCommission: 0,
    lateFees: 0,
    doublePayments: 0,
    dealType: 'subject-to',
    purchasePrice: 250000,
    marketAppreciationRate: 3.5,
    timeHorizonYears: 5,
    interestRate: 6.5,
    buyerDownPayments: 0,
  });

  const [metrics, setMetrics] = useState<CalculatedMetrics>({
    ltv: 0,
    equity: 0,
    monthlyCashflow: 0,
    annualCashflow: 0,
    totalInvestment: 0,
    roi: 0,
    totalExpenses: 0,
    netProfit: 0,
  });

  const [disreetCalculation, setDisreetCalculation] = useState<DISREETCalculation>({
    discount: 0,
    rentCashflow: 0,
    marketAppreciation: 0,
    loanPaydown: 0,
    taxDepreciation: 0,
    totalProfit: 0,
    annualizedReturn: 0,
  });

  const [debtAnalysis, setDebtAnalysis] = useState<DebtAnalysis>({
    totalDebt: 0,
    goodDebt: 0,
    badDebt: 0,
    debtServiceCoverage: 0,
    classification: 'excellent',
    reasoning: [],
  });

  const [activeTab, setActiveTab] = useState('calculator');
  useState(false);
  useState(false);

  // Re‑calculate everything whenever any input data changes
  useEffect(() => {
    calculateMetrics();
    calculateDISREET();
    analyzeDebt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const calculateMetrics = () => {
    const ltv = (data.existingMortgage / data.propertyValue) * 100;
    const equity = data.propertyValue - data.existingMortgage;

    let monthlyIncome = data.monthlyRent;
    let monthlyExpenses = data.monthlyHolding;

    const existingMortgagePayment = data.existingMortgage * 0.005;
    monthlyExpenses += existingMortgagePayment;

    if (data.dealType === 'wrap-around' && data.wrapAroundPayment) {
      monthlyIncome = data.wrapAroundPayment;
    } else if (data.dealType === 'option' && data.optionPremium) {
      monthlyIncome += data.optionPremium / 12;
    }

    const monthlyCashflow = monthlyIncome - monthlyExpenses;
    const annualCashflow = monthlyCashflow * 12;

    const totalExpenses =
      data.downPayment +
      data.closingCosts +
      data.repairCosts +
      data.lateFees +
      data.doublePayments +
      data.agentCommission;

    let totalInvestment = totalExpenses;
    if (data.dealType === 'assignment' && data.assignmentFee) {
      totalInvestment = Math.max(1000, totalExpenses);
    }

    let netProfit = annualCashflow;
    if (data.dealType === 'assignment' && data.assignmentFee) {
      netProfit = data.assignmentFee;
    } else if (data.dealType === 'trade' && data.assetTradeValue) {
      netProfit += data.assetTradeValue;
    }

    const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

    setMetrics({
      ltv: Math.round(ltv * 100) / 100,
      equity,
      monthlyCashflow: Math.round(monthlyCashflow * 100) / 100,
      annualCashflow: Math.round(annualCashflow * 100) / 100,
      totalInvestment,
      roi: Math.round(roi * 100) / 100,
      totalExpenses,
      netProfit: Math.round(netProfit * 100) / 100,
    });
  };

  const calculateDISREET = () => {
    const discount = Math.max(0, data.propertyValue - data.purchasePrice);

    const rentCashflow = metrics.annualCashflow * data.timeHorizonYears;

    const futureValue =
      data.propertyValue *
      Math.pow(1 + data.marketAppreciationRate / 100, data.timeHorizonYears);
    const marketAppreciation = futureValue - data.propertyValue;

    const monthlyRate = data.interestRate / 100 / 12;
    const numPayments = data.timeHorizonYears * 12;
    const monthlyPayment = data.existingMortgage * 0.005;

    let remainingBalance = data.existingMortgage;
    let principalPaid = 0;

    for (let i = 0; i < numPayments; i++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = Math.max(0, monthlyPayment - interestPayment);
      principalPaid += principalPayment;
      remainingBalance -= principalPayment;
    }

    const loanPaydown = principalPaid;

    const annualDepreciation = (data.propertyValue * 0.8) / 27.5;
    const taxDepreciation = annualDepreciation * data.timeHorizonYears * 0.22;

    const totalProfit = discount + rentCashflow + marketAppreciation + loanPaydown + taxDepreciation;

    // Use the *calculated* total investment from metrics rather than a non‑existent
    // property field.
    const annualizedReturn =
      metrics.totalInvestment > 0
        ? (Math.pow(1 + totalProfit / metrics.totalInvestment, 1 / data.timeHorizonYears) - 1) * 100
        : 0;

    let additionalIncome = 0;
    if (data.buyerDownPayments) additionalIncome += data.buyerDownPayments;
    if (data.dealType === 'assignment' && data.assignmentFee) additionalIncome += data.assignmentFee;

    setDisreetCalculation({
      discount: Math.round(discount),
      rentCashflow: Math.round(rentCashflow),
      marketAppreciation: Math.round(marketAppreciation),
      loanPaydown: Math.round(loanPaydown),
      taxDepreciation: Math.round(taxDepreciation),
      totalProfit: Math.round(totalProfit + additionalIncome),
      annualizedReturn: Math.round(annualizedReturn * 100) / 100,
    });
  };

  const analyzeDebt = () => {
    const totalDebt = data.existingMortgage + (data.sellerFinancing || 0);
    const monthlyDebtService =
      data.existingMortgage * 0.005 + (data.sellerFinancing ? data.sellerFinancing * 0.004 : 0);

    const monthlyIncome = data.monthlyRent + (data.wrapAroundPayment || 0);
    const debtServiceCoverage = monthlyIncome > 0 ? monthlyIncome / monthlyDebtService : 0;

    const isServicedByProperty = metrics.monthlyCashflow >= 0;
    const generatesCashflow = metrics.monthlyCashflow > 0;
    const appreciatesOverTime = data.marketAppreciationRate > 2;
    const hasPositiveEquity = metrics.equity > 0;

    let goodDebt = 0;
    let badDebt = 0;
    const reasoning: string[] = [];

    if (isServicedByProperty) {
      goodDebt += totalDebt * 0.8;
      reasoning.push('Долг обслуживается доходом от недвижимости, а не из кармана');
    } else {
      badDebt += totalDebt * 0.3;
      reasoning.push('Требует доплаты из собственных средств');
    }

    if (generatesCashflow) {
      goodDebt += totalDebt * 0.1;
      reasoning.push('Генерирует положительный денежный поток');
    }

    if (appreciatesOverTime) {
      goodDebt += totalDebt * 0.1;
      reasoning.push('Актив растет в цене быстрее инфляции');
    } else {
      reasoning.push('Низкий рост стоимости актива');
    }

    if (hasPositiveEquity) {
      reasoning.push('Есть положительная equity как подушка безопасности');
    } else {
      badDebt += Math.abs(metrics.equity);
      reasoning.push('Отрицательная equity увеличивает риски');
    }

    // Ensure badDebt never becomes negative after the adjustments above
    badDebt = Math.max(0, totalDebt - goodDebt);

    let classification: 'excellent' | 'good' | 'acceptable' | 'poor';
    if (debtServiceCoverage > 1.5 && isServicedByProperty && generatesCashflow) {
      classification = 'excellent';
    } else if (debtServiceCoverage > 1.2 && isServicedByProperty) {
      classification = 'good';
    } else if (debtServiceCoverage > 1.0) {
      classification = 'acceptable';
    } else {
      classification = 'poor';
    }

    setDebtAnalysis({
      totalDebt: Math.round(totalDebt),
      goodDebt: Math.round(goodDebt),
      badDebt: Math.round(badDebt),
      debtServiceCoverage: Math.round(debtServiceCoverage * 100) / 100,
      classification,
      reasoning,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getRiskLevel = (ltv: number) => {
    if (ltv > 100) return { level: 'Высокий', color: 'text-red-600', bg: 'bg-red-50' };
    if (ltv > 80) return { level: 'Средний', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'Низкий', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const getROIStatus = (roi: number) => {
    if (roi > 50) return { status: 'Отличный', color: 'text-green-600' };
    if (roi > 20) return { status: 'Хороший', color: 'text-blue-600' };
    if (roi > 0) return { status: 'Приемлемый', color: 'text-yellow-600' };
    return { status: 'Убыточный', color: 'text-red-600' };
  };

  const getDebtClassificationColor = (classification: string) => {
    switch (classification) {
      case 'excellent':
        return 'text-green-700 bg-green-100';
      case 'good':
        return 'text-blue-700 bg-blue-100';
      case 'acceptable':
        return 'text-yellow-700 bg-yellow-100';
      case 'poor':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getDebtClassificationText = (classification: string) => {
    switch (classification) {
      case 'excellent':
        return 'Отличный долг';
      case 'good':
        return 'Хороший долг';
      case 'acceptable':
        return 'Приемлемый долг';
      case 'poor':
        return 'Плохой долг';
      default:
        return 'Неопределено';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-8 rounded-t-2xl">
          <h1 className="text-3xl font-bold mb-2">Расширенный финансовый анализатор</h1>
          <p className="text-blue-100">DISREET анализ прибыли и оценка качества долга</p>
        </div>

        <div className="p-8">
          {/* Вкладки */}
          <div className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'calculator', label: 'Калькулятор' },
              { id: 'disreet', label: 'DISREET Анализ' },
              { id: 'debt', label: 'Анализ долга' },
              { id: 'closing', label: 'Closing Day' },
              { id: 'post-closing', label: 'Пост-закрытие' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* -------------------------- CALCULATOR -------------------------- */}
          {activeTab === 'calculator' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Input Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Параметры недвижимости</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Рыночная стоимость (FMV)
                      </label>
                      <input
                        type="number"
                        value={data.propertyValue}
                        onChange={(e) => setData({ ...data, propertyValue: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Цена покупки
                      </label>
                      <input
                        type="number"
                        value={data.purchasePrice}
                        onChange={(e) => setData({ ...data, purchasePrice: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Существующая ипотека
                      </label>
                      <input
                        type="number"
                        value={data.existingMortgage}
                        onChange={(e) => setData({ ...data, existingMortgage: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Месячная аренда/доход
                      </label>
                      <input
                        type="number"
                        value={data.monthlyRent}
                        onChange={(e) => setData({ ...data, monthlyRent: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Down Payments от покупателей
                      </label>
                      <input
                        type="number"
                        value={data.buyerDownPayments || 0}
                        onChange={(e) => setData({ ...data, buyerDownPayments: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Рост рынка в год (%)
                      </label>
                      <input
                        type="number"
                        value={data.marketAppreciationRate}
                        onChange={(e) => setData({ ...data, marketAppreciationRate: Number(e.target.value) })}
                        step="0.1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculated Results */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Ключевые метрики</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">LTV:</span>
                        <div className="text-right">
                          <span className="font-semibold">{metrics.ltv}%</span>
                          <div
                            className={`text-xs px-2 py-1 rounded-full inline-block ml-2 ${getRiskLevel(
                              metrics.ltv
                            ).bg} ${getRiskLevel(metrics.ltv).color}`}
                          >
                            {getRiskLevel(metrics.ltv).level}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Equity:</span>
                        <span className="font-semibold">{formatCurrency(metrics.equity)}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">ROI:</span>
                        <div className="text-right">
                          <span className="font-semibold">{metrics.roi}%</span>
                          <div
                            className={`text-xs px-2 py-1 rounded-full inline-block ml-2 ${getROIStatus(
                              metrics.roi
                            ).color}`}
                          >
                            {getROIStatus(metrics.roi).status}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional sections can be added here */}
                </div>
              </div>
            </div>
          )}

          {/* -------------------------- DISREET -------------------------- */}
          {activeTab === 'disreet' && (
            <div className="space-y-8">
              {/* DISREET Banner */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <i className="ri-money-dollar-circle-line text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">DISREET Анализ прибыли</h3>
                    <p className="text-purple-100">Комплексная оценка всех источников дохода</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Components */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 border shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Компоненты DISREET</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="font-bold text-blue-600">D</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">DIScount</h4>
                            <p className="text-sm text-gray-600">Дисконт от рыночной стоимости</p>
                          </div>
                        </div>
                        <span className="font-semibold text-blue-600">
                          {formatCurrency(disreetCalculation.discount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="font-bold text-green-600">R</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Rent/Cashflow</h4>
                            <p className="text-sm text-gray-600">
                              Чистый денежный поток за {data.timeHorizonYears} лет
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(disreetCalculation.rentCashflow)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="font-bold text-purple-600">E</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Equity (Market)</h4>
                            <p className="text-sm text-gray-600">
                              Рост стоимости {data.marketAppreciationRate}%/год
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-purple-600">
                          {formatCurrency(disreetCalculation.marketAppreciation)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="font-bold text-orange-600">E</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Equity (Paydown)</h4>
                            <p className="text-sm text-gray-600">Погашение основного долга</p>
                          </div>
                        </div>
                        <span className="font-semibold text-orange-600">
                          {formatCurrency(disreetCalculation.loanPaydown)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="font-bold text-yellow-600">T</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Tax Depreciation</h4>
                            <p className="text-sm text-gray-600">Экономия на налогах</p>
                          </div>
                        </div>
                        <span className="font-semibold text-yellow-600">
                          {formatCurrency(disreetCalculation.taxDepreciation)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Results */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold mb-4 text-green-800">Итоговые результаты</h3>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          Общая прибыль за {data.timeHorizonYears} лет:
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          {formatCurrency(disreetCalculation.totalProfit)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Годовая доходность:</span>
                        <span className="text-xl font-semibold text-green-600">
                          {disreetCalculation.annualizedReturn}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t">
                        <span className="text-gray-700">Первоначальные инвестиции:</span>
                        <span className="font-medium text-gray-800">
                          {formatCurrency(metrics.totalInvestment)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Коэффициент доходности:</span>
                        <span className="font-semibold text-blue-600">
                          {metrics.totalInvestment > 0
                            ? (disreetCalculation.totalProfit / metrics.totalInvestment).toFixed(1)
                            : '∞'}
                          x
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DISREET Breakdown Chart */}
                  <div className="bg-white rounded-xl p-6 border shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Структура прибыли</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Discount', value: disreetCalculation.discount, color: 'bg-blue-500' },
                        { name: 'Cashflow', value: disreetCalculation.rentCashflow, color: 'bg-green-500' },
                        { name: 'Market Growth', value: disreetCalculation.marketAppreciation, color: 'bg-purple-500' },
                        { name: 'Loan Paydown', value: disreetCalculation.loanPaydown, color: 'bg-orange-500' },
                        { name: 'Tax Benefits', value: disreetCalculation.taxDepreciation, color: 'bg-yellow-500' },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="w-20 text-sm text-gray-600">{item.name}:</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                            <div
                              className={`h-full ${item.color} transition-all duration-1000 flex items-center justify-center`}
                              style={{
                                width: `${Math.max(5, (item.value / disreetCalculation.totalProfit) * 100)}%`,
                              }}
                            >
                              <span className="text-white text-xs font-medium">
                                {formatCurrency(item.value)}
                              </span>
                            </div>
                          </div>
                          <div className="w-12 text-sm text-gray-600 text-right">
                            {Math.round((item.value / disreetCalculation.totalProfit) * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------- DEBT ANALYSIS -------------------------- */}
          {activeTab === 'debt' && (
            <div className="space-y-8">
              {/* Axiom Banner */}
              <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <i className="ri-scales-line text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Аксиома #4</h3>
                    <p className="text-green-100">
                      Сумма долга в бизнесе не является проблемой, пока он обслуживается
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Debt Classification */}
                <div className="bg-white rounded-xl p-6 border shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Классификация долга</h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Общий долг:</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(debtAnalysis.totalDebt)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Хороший долг:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(debtAnalysis.goodDebt)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Плохой долг:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(debtAnalysis.badDebt)}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">Коэффициент покрытия долга:</span>
                      <span
                        className={`font-semibold ${
                          debtAnalysis.debtServiceCoverage >= 1.2
                            ? 'text-green-600'
                            : debtAnalysis.debtServiceCoverage >= 1.0
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {debtAnalysis.debtServiceCoverage}x
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Отношение дохода к долговым обязательствам</p>
                  </div>

                  <div className={`p-4 rounded-lg ${getDebtClassificationColor(debtAnalysis.classification)}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="ri-award-line"></i>
                      <span className="font-semibold">{getDebtClassificationText(debtAnalysis.classification)}</span>
                    </div>
                  </div>
                </div>

                {/* Debt Analysis Reasoning */}
                <div className="bg-white rounded-xl p-6 border shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Анализ и обоснование</h3>

                  <div className="space-y-3 mb-6">
                      <h4 className="font-medium text-gray-700">Критерии &quot;хорошего&quot; долга:</h4>
                    <ul className="space-y-2">
                      {debtAnalysis.reasoning.map((reason, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <i
                            className={`mt-0.5 text-sm ${
                              reason.includes('не') ||
                              reason.includes('Требует') ||
                              reason.includes('Низкий') ||
                              reason.includes('Отрицательная')
                                ? 'ri-close-circle-line text-red-500'
                                : 'ri-check-line text-green-500'
                            }`}
                          ></i>
                          <span className="text-sm text-gray-700">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Рекомендации по управлению долгом:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {debtAnalysis.classification === 'excellent' && (
                        <>
                          <li>• Отличная структура долга - можете масштабировать</li>
                          <li>• Рассмотрите реинвестирование прибыли в новые объекты</li>
                        </>
                      )}
                      {debtAnalysis.classification === 'good' && (
                        <>
                          <li>• Хорошая структура с небольшими улучшениями</li>
                          <li>• Увеличьте доходность для лучшего покрытия</li>
                        </>
                      )}
                      {debtAnalysis.classification === 'acceptable' && (
                        <>
                          <li>• Требуется оптимизация денежного потока</li>
                          <li>• Рассмотрите рефинансирование под лучшие условия</li>
                        </>
                      )}
                      {debtAnalysis.classification === 'poor' && (
                        <>
                          <li>• Срочно требуется реструктуризация</li>
                          <li>• Увеличьте доходы или снизьте расходы</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Debt Visualization */}
              <div className="bg-white rounded-xl p-6 border shadow-sm">
                <h3 className="text-lg font-semibold mb-6 text-gray-800">Визуализация структуры долга</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Good vs Bad Debt */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-4">Соотношение хорошего и плохого долга</h4>
                    <div className="relative h-40 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 bg-green-500 transition-all duration-1000"
                        style={{
                          height: `${(debtAnalysis.goodDebt / debtAnalysis.totalDebt) * 100}%`,
                          width: '50%',
                        }}
                      >
                        <div className="absolute top-2 left-2 text-white text-sm font-medium">Хороший</div>
                      </div>
                      <div
                        className="absolute bottom-0 right-0 bg-red-500 transition-all duration-1000"
                        style={{
                          height: `${(debtAnalysis.badDebt / debtAnalysis.totalDebt) * 100}%`,
                          width: '50%',
                        }}
                      >
                        <div className="absolute top-2 left-2 text-white text-sm font-medium">Плохой</div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                      <span>Хороший: {formatCurrency(debtAnalysis.goodDebt)}</span>
                      <span>Плохой: {formatCurrency(debtAnalysis.badDebt)}</span>
                    </div>
                  </div>

                  {/* Service Coverage */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-4">Покрытие долгового сервиса</h4>
                    <div className="relative h-40 bg-gray-100 rounded-lg flex items-end justify-center">
                      <div
                        className={`w-20 transition-all duration-1000 ${
                          debtAnalysis.debtServiceCoverage >= 1.5
                            ? 'bg-green-500'
                            : debtAnalysis.debtServiceCoverage >= 1.2
                            ? 'bg-blue-500'
                            : debtAnalysis.debtServiceCoverage >= 1.0
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ height: `${Math.min(100, (debtAnalysis.debtServiceCoverage / 2) * 100)}%` }}
                      >
                        <div className="text-center text-white text-sm font-medium mt-2">
                          {debtAnalysis.debtServiceCoverage}x
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <div className="w-full h-1 bg-gray-300 rounded">
                        <div className="w-1/2 h-1 bg-red-500 rounded"></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0x (опасно)</span>
                        <span>1x (минимум)</span>
                        <span>2x (отлично)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------- CLOSING DAY -------------------------- */}
          {activeTab === 'closing' && (
            <div className="space-y-8">
              {/* Closing Day Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg p-6 text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <i className="ri-building-2-line text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Closing Day Simulator</h3>
                    <p className="text-amber-100">
                      Симуляция дня закрытия сделки - обмен документами и чеками
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Settlement Statement */}
                <div className="bg-white rounded-xl p-6 border shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <i className="ri-file-list-3-line mr-2 text-blue-600"></i>
                    Settlement Statement
                  </h3>

                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-50 p-4 border-b">
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-900">HUD-1 SETTLEMENT STATEMENT</h4>
                        <p className="text-sm text-gray-600">
                          Property: 1245 Elm Street, Austin, TX 78704
                        </p>
                        <p className="text-sm text-gray-600">
                          Settlement Date: {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Buyer Side */}
                    <div className="p-4 border-b">
                      <h5 className="font-medium text-green-700 mb-3">BUYER (YOU):</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Purchase Price:</span>
                          <span>{formatCurrency(data.purchasePrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Down Payment:</span>
                          <span className="text-red-600">-{formatCurrency(data.downPayment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Closing Costs:</span>
                          <span className="text-red-600">-{formatCurrency(data.closingCosts)}</span>
                        </div>
                        {data.buyerDownPayments && data.buyerDownPayments > 0 && (
                          <div className="flex justify-between">
                            <span>Down Payment Received:</span>
                            <span className="text-green-600">
                              +{formatCurrency(data.buyerDownPayments)}
                            </span>
                          </div>
                        )}
                        {data.dealType === 'assignment' && data.assignmentFee && (
                          <div className="flex justify-between">
                            <span>Assignment Fee:</span>
                            <span className="text-green-600">
                              +{formatCurrency(data.assignmentFee)}
                            </span>
                          </div>
                        )}
                        <hr />
                        <div className="flex justify-between font-semibold">
                          <span>Cash Required:</span>
                          <span
                            className={`${
                              data.downPayment + data.closingCosts - (data.buyerDownPayments || 0) - (data.assignmentFee || 0) > 0
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}
                          >
                            {formatCurrency(
                              Math.abs(
                                data.downPayment +
                                  data.closingCosts -
                                  (data.buyerDownPayments || 0) -
                                  (data.assignmentFee || 0)
                              )
                            )}
                            {data.downPayment + data.closingCosts - (data.buyerDownPayments || 0) - (data.assignmentFee || 0) <=
                            0
                              ? ' (to you)'
                              : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Seller Side */}
                    <div className="p-4">
                      <h5 className="font-medium text-blue-700 mb-3">SELLER:</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Sale Price:</span>
                          <span>{formatCurrency(data.purchasePrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Existing Mortgage Payoff:</span>
                          <span className="text-red-600">-{formatCurrency(data.existingMortgage)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Arrears Paid:</span>
                          <span className="text-red-600">-{formatCurrency(data.lateFees)}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between font-semibold">
                          <span>Net to Seller:</span>
                          <span
                            className={`${
                              data.purchasePrice - data.existingMortgage - data.lateFees >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {formatCurrency(
                              Math.abs(data.purchasePrice - data.existingMortgage - data.lateFees)
                            )}
                            {data.purchasePrice - data.existingMortgage - data.lateFees < 0 ? ' (seller pays)' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Exchange */}
                <div className="bg-white rounded-xl p-6 border shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <i className="ri-file-transfer-line mr-2 text-purple-600"></i>
                    Обмен документами
                  </h3>

                  <div className="space-y-4">
                    {/* Documents to Sign */}
                    <div className="border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-3">Документы к подписанию:</h4>
                      <div className="space-y-3">
                        {[
                          { name: 'Purchase and Sale Agreement', icon: 'ri-file-text-line' },
                          { name: 'Deed of Trust', icon: 'ri-shield-check-line' },
                          { name: 'Authorization Letter', icon: 'ri-user-received-line' },
                          { name: 'Property Disclosure', icon: 'ri-information-line' },
                        ].map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded">
                            <div className="flex items-center space-x-3">
                              {/* Fixed syntax – template literal wrapped correctly */}
                              <i className={`${doc.icon} text-blue-600`}></i>
                              <span className="text-sm font-medium">{doc.name}</span>
                            </div>
                            <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
                              Подписать
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Keys and Property Transfer */}
                    <div className="border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-3">Передача собственности:</h4>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                        <div className="flex items-center space-x-3">
                          <i className="ri-key-line text-green-600 text-xl"></i>
                          <div>
                            <span className="text-sm font-medium block">Ключи от дома</span>
                            <span className="text-xs text-gray-600">1245 Elm Street, Austin, TX</span>
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer">
                          Получить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Check Exchange Simulation */}
              <div className="bg-white rounded-xl p-6 border shadow-sm">
                <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center">
                  <i className="ri-money-dollar-box-line mr-2 text-green-600"></i>
                  Обмен чеками и платежами
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Checks You Receive */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-green-700 flex items-center">
                      <i className="ri-arrow-down-line mr-2"></i>
                      Вы получаете:
                    </h4>

                    {data.buyerDownPayments && data.buyerDownPayments > 0 && (
                      <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Down Payment от покупателя</span>
                          <i className="ri-check-line text-green-600"></i>
                        </div>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(data.buyerDownPayments)}</div>
                        <div className="text-xs text-gray-600 mt-1">Чек #001</div>
                      </div>
                    )}

                    {data.dealType === 'assignment' && data.assignmentFee && (
                      <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Assignment Fee</span>
                          <i className="ri-check-line text-green-600"></i>
                        </div>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(data.assignmentFee)}</div>
                        <div className="text-xs text-gray-600 mt-1">Чек #002</div>
                      </div>
                    )}

                    {(!data.buyerDownPayments || data.buyerDownPayments === 0) &&
                      (!data.assignmentFee || data.assignmentFee === 0) && (
                        <div className="text-center p-4 text-gray-500 border border-gray-200 rounded-lg">
                          <i className="ri-inbox-line text-2xl mb-2"></i>
                          <p className="text-sm">Нет входящих платежей</p>
                        </div>
                      )}
                  </div>

                  {/* Checks You Pay */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-red-700 flex items-center">
                      <i className="ri-arrow-up-line mr-2"></i>
                      Вы платите:
                    </h4>

                    <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Down Payment</span>
                        <i className="ri-close-line text-red-600"></i>
                      </div>
                      <div className="text-2xl font-bold text-red-600">{formatCurrency(data.downPayment)}</div>
                      <div className="text-xs text-gray-600 mt-1">Чек #101</div>
                    </div>

                    <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Closing Costs</span>
                        <i className="ri-close-line text-red-600"></i>
                      </div>
                      <div className="text-2xl font-bold text-red-600">{formatCurrency(data.closingCosts)}</div>
                      <div className="text-xs text-gray-600 mt-1">Чек #102</div>
                    </div>
                  </div>

                  {/* Net Result */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-purple-700 flex items-center">
                      <i className="ri-scales-line mr-2"></i>
                      Итого:
                    </h4>

                    <div
                      className={`border-2 rounded-lg p-4 ${
                        (data.buyerDownPayments || 0) + (data.assignmentFee || 0) - data.downPayment - data.closingCosts >=
                        0
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-sm font-medium mb-2">
                          {(data.buyerDownPayments || 0) + (data.assignmentFee || 0) - data.downPayment - data.closingCosts >=
                          0
                            ? 'Вы получите'
                            : 'Требуется доплата'}
                        </div>
                        <div
                          className={`text-3xl font-bold ${
                            (data.buyerDownPayments || 0) + (data.assignmentFee || 0) - data.downPayment - data.closingCosts >=
                            0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(
                            Math.abs(
                              (data.buyerDownPayments || 0) +
                                (data.assignmentFee || 0) -
                                data.downPayment -
                                data.closingCosts
                            )
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mt-2">Чистый результат closing</div>
                      </div>
                    </div>

                    {/* Celebration */}
                    {(data.buyerDownPayments || 0) + (data.assignmentFee || 0) - data.downPayment - data.closingCosts >=
                      0 && (
                      <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <i className="ri-trophy-line text-yellow-600 text-2xl mb-2"></i>
                        <p className="text-sm font-medium text-yellow-800">
                          Поздравляем с успешным closing!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Closing Actions */}
              <div className="flex justify-center space-x-4">
                <button

                  className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-2"
                >
                  <i className="ri-play-circle-line"></i>
                  <span>Начать Closing</span>
                </button>
                <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-2">
                  <i className="ri-printer-line"></i>
                  <span>Печать документов</span>
                </button>
                <button
                  onClick={() => setActiveTab('post-closing')}
                  className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-2"
                >
                  <i className="ri-arrow-right-line"></i>
                  <span>Перейти к управлению</span>
                </button>
              </div>
            </div>
          )}

          {/* -------------------------- POST‑CLOSING -------------------------- */}
          {activeTab === 'post-closing' && (
            <div>
              <PostClosingSimulator />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
