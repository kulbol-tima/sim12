
'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '../../lib/store';

interface DealStructure {
  subjectTo?: {
    enabled: boolean;
    downPayment: number;
    closingCosts: number;
    monthlyPayment: number;
    remainingBalance: number;
    authorizationLetter: boolean;
  };
  sellerFinancing?: {
    enabled: boolean;
    amount: number;
    interestRate: number;
    term: number;
    monthlyPayment: number;
    securement: boolean;
  };
  wrapAround?: {
    enabled: boolean;
    newLoanAmount: number;
    newInterestRate: number;
    newMonthlyPayment: number;
    existingPayment: number;
    monthlyProfit: number;
    buyerProfile: string;
  };
  leaseOption?: {
    enabled: boolean;
    downPayment: number;
    monthlyRent: number;
    optionTerm: number;
    optionPrice: number;
    rentCredit: number;
    buyerMotivation: string;
  };
  wholesale?: {
    enabled: boolean;
    contractPrice: number;
    assignmentFee: number;
    cashBuyerType: string;
    marketingDays: number;
  };
  assetTrade?: {
    enabled: boolean;
    assets: Array<{
      type: string;
      description: string;
      value: number;
    }>;
    totalValue: number;
    integrationMethod: string;
  };
  totalStructure: {
    purchasePrice: number;
    totalDownPayment: number;
    buyerMonthlyPayment: number;
    sellerMonthlyIncome: number;
    userMonthlyProfit: number;
  };
}

interface Document {
  type: 'psa' | 'deed' | 'promissory-note' | 'authorization-letter' | 'wrap-around-note' | 'lease-option' | 'assignment-contract' | 'asset-transfer';
  name: string;
  status: 'draft' | 'ready' | 'signed';
  description: string;
}

function DealStructureContent() {
  const { scenario } = useStore();
  const searchParams = useSearchParams();
  searchParams.get('scenario');

  const [currentStep, setCurrentStep] = useState<'structure' | 'documentation' | 'closing'>('structure');
  const [dealStructure, setDealStructure] = useState<DealStructure>({
    totalStructure: {
      purchasePrice: 0,
      totalDownPayment: 0,
      buyerMonthlyPayment: 0,
      sellerMonthlyIncome: 0,
      userMonthlyProfit: 0
    }
  });

  const [documents, setDocuments] = useState<Document[]>([
    {
      type: 'psa',
      name: 'Purchase and Sale Agreement (PSA)',
      status: 'draft',
      description: 'Основной договор купли-продажи недвижимости'
    },
    {
      type: 'deed',
      name: 'Deed (Правоустанавливающий документ)',
      status: 'draft',
      description: 'Документ о передаче права собственности'
    }
  ]);

  if (!scenario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-file-list-3-line text-3xl text-gray-400"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Сценарий не найден</h3>
          <p className="text-gray-500 mb-6">
            Пожалуйста, сгенерируйте сценарий, чтобы начать структурирование сделки.
          </p>
          <Link
            href="/scenario-generator"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            К генератору сценариев
          </Link>
        </div>
      </div>
    );
  }

  const enableSubjectTo = (enabled: boolean) => {
    if (enabled) {
      const newStructure = { ...dealStructure };
      newStructure.subjectTo = {
        enabled: true,
        downPayment: 10,
        closingCosts: 3500,
        monthlyPayment: scenario.property.monthlyPayment,
        remainingBalance: scenario.property.owedAmount,
        authorizationLetter: false
      };

      if (!documents.find(d => d.type === 'authorization-letter')) {
        setDocuments(prev => [...prev, {
          type: 'authorization-letter',
          name: 'Authorization Letter',
          status: 'draft',
          description: 'Письмо-разрешение для общения с банком продавца'
        }]);
      }

      setDealStructure(newStructure);
    } else {
      const newStructure = { ...dealStructure };
      delete newStructure.subjectTo;
      setDealStructure(newStructure);

      setDocuments(prev => prev.filter(d => d.type !== 'authorization-letter'));
    }
    calculateTotal();
  };

  const enableSellerFinancing = (enabled: boolean) => {
    if (enabled) {
      const newStructure = { ...dealStructure };
      const financingAmount = Math.min(50000, scenario.property.fmv - scenario.property.owedAmount);
      const interestRate = 4.5;
      const term = 10;

      newStructure.sellerFinancing = {
        enabled: true,
        amount: financingAmount,
        interestRate,
        term,
        monthlyPayment: calculateMonthlyPayment(financingAmount, interestRate, term),
        securement: false
      };

      if (!documents.find(d => d.type === 'promissory-note')) {
        setDocuments(prev => [...prev, {
          type: 'promissory-note',
          name: 'Promissory Note (Долговая расписка)',
          status: 'draft',
          description: 'Документ о займе от продавца покупателю'
        }]);
      }

      setDealStructure(newStructure);
    } else {
      const newStructure = { ...dealStructure };
      delete newStructure.sellerFinancing;
      setDealStructure(newStructure);

      setDocuments(prev => prev.filter(d => d.type !== 'promissory-note'));
    }
    calculateTotal();
  };

  const enableWrapAround = (enabled: boolean) => {
    if (enabled) {
      const newStructure = { ...dealStructure };
      const existingPayment = scenario.property.monthlyPayment;
      const newMonthlyPayment = 2700;
      const monthlyProfit = newMonthlyPayment - existingPayment;

      newStructure.wrapAround = {
        enabled: true,
        newLoanAmount: scenario.property.fmv * 0.85,
        newInterestRate: 6.5,
        newMonthlyPayment,
        existingPayment,
        monthlyProfit,
        buyerProfile: 'Покупатель с хорошим доходом, но плохой кредитной историей'
      };

      if (!documents.find(d => d.type === 'wrap-around-note')) {
        setDocuments(prev => [...prev, {
          type: 'wrap-around-note',
          name: 'Wrap-Around Mortgage Note',
          status: 'draft',
          description: 'Новый займ, который "оборачивает" существующую ипотеку'
        }]);
      }

      setDealStructure(newStructure);
    } else {
      const newStructure = { ...dealStructure };
      delete newStructure.wrapAround;
      setDealStructure(newStructure);

      setDocuments(prev => prev.filter(d => d.type !== 'wrap-around-note'));
    }
    calculateTotal();
  };

  const enableLeaseOption = (enabled: boolean) => {
    if (enabled) {
      const newStructure = { ...dealStructure };
      const downPayment = 15000;
      const monthlyRent = 2500;
      const rentCredit = 300;

      newStructure.leaseOption = {
        enabled: true,
        downPayment,
        monthlyRent,
        optionTerm: 24,
        optionPrice: scenario.property.fmv + 15000,
        rentCredit,
        buyerMotivation: 'Не может пройти квалификацию сейчас, ожидает улучшения кредитной истории'
      };

      if (!documents.find(d => d.type === 'lease-option')) {
        setDocuments(prev => [...prev, {
          type: 'lease-option',
          name: 'Lease with Option to Purchase Agreement',
          status: 'draft',
          description: 'Договор аренды с правом выкупа'
        }]);
      }

      setDealStructure(newStructure);
    } else {
      const newStructure = { ...dealStructure };
      delete newStructure.leaseOption;
      setDealStructure(newStructure);

      setDocuments(prev => prev.filter(d => d.type !== 'lease-option'));
    }
    calculateTotal();
  };

  const enableWholesale = (enabled: boolean) => {
    if (enabled) {
      const newStructure = { ...dealStructure };
      const contractPrice = scenario.property.fmv * 0.75;
      const assignmentFee = 15000;

      newStructure.wholesale = {
        enabled: true,
        contractPrice,
        assignmentFee,
        cashBuyerType: 'Местный инвестор-флиппер с готовой наличностью',
        marketingDays: 14
      };

      if (!documents.find(d => d.type === 'assignment-contract')) {
        setDocuments(prev => [...prev, {
          type: 'assignment-contract',
          name: 'Assignment of Contract',
          status: 'draft',
          description: 'Договор переуступки прав по контракту'
        }]);
      }

      setDealStructure(newStructure);
    } else {
      const newStructure = { ...dealStructure };
      delete newStructure.wholesale;
      setDealStructure(newStructure);

      setDocuments(prev => prev.filter(d => d.type !== 'assignment-contract'));
    }
    calculateTotal();
  };

  const enableAssetTrade = (enabled: boolean) => {
    if (enabled) {
      const newStructure = { ...dealStructure };
      const selectedAssets = scenario.seller.additionalAssets
        ? scenario.seller.additionalAssets.slice(0, 2).map(asset => {
          const match = asset.match(/(.+) \(\$(.+)\)/);
          if (match) {
            let type = 'other';
            if (match[1].toLowerCase().includes('ford') || match[1].toLowerCase().includes('sea ray')) {
              type = 'vehicle';
            } else if (match[1].toLowerCase().includes('harley')) {
              type = 'motorcycle';
            } else if (match[1].toLowerCase().includes('ювелирные')) {
              type = 'jewelry';
            }
            return {
              type: type,
              description: match[1],
              value: parseInt(match[2].replace(/,/g, ''), 10)
            };
          }
          return {
            type: 'other',
            description: asset,
            value: 0
          };
        })
        : [];
      const totalValue = selectedAssets.reduce((sum, asset) => sum + asset.value, 0);

      newStructure.assetTrade = {
        enabled: true,
        assets: selectedAssets,
        totalValue,
        integrationMethod: 'Активы засчитываются как дополнительный down payment для покрытия отрицательной equity'
      };

      if (!documents.find(d => d.type === 'asset-transfer')) {
        setDocuments(prev => [...prev, {
          type: 'asset-transfer',
          name: 'Asset Transfer Agreement',
          status: 'draft',
          description: 'Договор передачи дополнительных активов'
        }]);
      }

      setDealStructure(newStructure);
    } else {
      const newStructure = { ...dealStructure };
      delete newStructure.assetTrade;
      setDealStructure(newStructure);

      setDocuments(prev => prev.filter(d => d.type !== 'asset-transfer'));
    }
    calculateTotal();
  };

  const calculateMonthlyPayment = (principal: number, rate: number, years: number): number => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;
    return Math.round((principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1));
  };

  const calculateTotal = () => {
    setTimeout(() => {
      const newTotal = { ...dealStructure.totalStructure };

      newTotal.purchasePrice = scenario.property.fmv;
      newTotal.totalDownPayment =
        (dealStructure.subjectTo?.downPayment || 0) +
        (dealStructure.subjectTo?.closingCosts || 0) +
        (dealStructure.leaseOption?.downPayment || 0);

      newTotal.buyerMonthlyPayment =
        (dealStructure.subjectTo?.monthlyPayment || 0) +
        (dealStructure.sellerFinancing?.monthlyPayment || 0) +
        (dealStructure.wrapAround?.newMonthlyPayment || 0) +
        (dealStructure.leaseOption?.monthlyRent || 0);

      newTotal.sellerMonthlyIncome = (dealStructure.sellerFinancing?.monthlyPayment || 0);

      newTotal.userMonthlyProfit =
        (dealStructure.wrapAround?.monthlyProfit || 0) +
        (dealStructure.leaseOption ? (dealStructure.leaseOption.monthlyRent - (scenario.property.monthlyPayment || 0)) : 0);

      setDealStructure(prev => ({
        ...prev,
        totalStructure: newTotal
      }));
    }, 100);
  };

  const updateSellerFinancing = (
    field: keyof NonNullable<DealStructure['sellerFinancing']>,
    value: number | boolean
  ) => {
    if (!dealStructure.sellerFinancing) return;

    const updated = {
      ...dealStructure.sellerFinancing,
      [field]: value,
    };

    if (field === 'amount' || field === 'interestRate' || field === 'term') {
      updated.monthlyPayment = calculateMonthlyPayment(
        updated.amount,
        updated.interestRate,
        updated.term
      );
    }

    setDealStructure(prev => ({
      ...prev,
      sellerFinancing: updated
    }));
    calculateTotal();
  };

  const updateWrapAround = (
    field: keyof NonNullable<DealStructure['wrapAround']>,
    value: number | string
  ) => {
    if (!dealStructure.wrapAround) return;

    const updated = {
      ...dealStructure.wrapAround,
      [field]: value,
    };

    if (field === 'newMonthlyPayment') {
      updated.monthlyProfit = (value as number) - updated.existingPayment;
    }

    setDealStructure(prev => ({
      ...prev,
      wrapAround: updated
    }));
    calculateTotal();
  };

  const updateLeaseOption = (
    field: keyof NonNullable<DealStructure['leaseOption']>,
    value: number | string
  ) => {
    if (!dealStructure.leaseOption) return;

    const updated = {
      ...dealStructure.leaseOption,
      [field]: value,
    };

    setDealStructure(prev => ({
      ...prev,
      leaseOption: updated
    }));
    calculateTotal();
  };

  const signDocument = (docType: string) => {
    setDocuments(prev => prev.map(doc =>
      doc.type === docType ? { ...doc, status: doc.status === 'draft' ? 'ready' : 'signed' } : doc
    ));
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-600';
      case 'ready':
        return 'bg-yellow-100 text-yellow-700';
      case 'signed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getDocumentStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Черновик';
      case 'ready':
        return 'Готов к подписанию';
      case 'signed':
        return 'Подписан';
      default:
        return 'Черновик';
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
              <Link href="/scenario-generator" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium whitespace-nowrap cursor-pointer">
                Сценарии
              </Link>
              <Link href="/negotiation" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium whitespace-nowrap cursor-pointer">
                Переговоры
              </Link>
              <Link href="/profile" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium whitespace-nowrap cursor-pointer">
                Профиль
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Структурирование сделки</h1>
          <p className="text-gray-600">{scenario.property.address} • FMV: ${scenario.property.fmv.toLocaleString()}</p>
        </div>

        {/* Axiom Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 mb-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-gem-line text-xl"></i>
            </div>
            <div>
              <h3 className="font-semibold">Аксиома #6</h3>
              <p className="text-purple-100 text-sm">Правильно структурированная сделка - ценный товар</p>
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentStep('structure')}
              className={`px-6 py-3 rounded-full font-medium transition-colors cursor-pointer ${
                currentStep === 'structure'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              1. Структура сделки
            </button>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <button
              onClick={() => setCurrentStep('documentation')}
              className={`px-6 py-3 rounded-full font-medium transition-colors cursor-pointer ${
                currentStep === 'documentation'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              2. Документация
            </button>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <button
              onClick={() => setCurrentStep('closing')}
              className={`px-6 py-3 rounded-full font-medium transition-colors cursor-pointer ${
                currentStep === 'closing'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              3. Закрытие сделки
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 'structure' && (
              <div className="space-y-6">
                {/* Subject To Option */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <i className="ri-home-line text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Subject to Existing Loan</h3>
                        <p className="text-sm text-gray-500">Принять существующую ипотеку продавца</p>
                      </div>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dealStructure.subjectTo?.enabled || false}
                        onChange={(e) => enableSubjectTo(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-sm font-medium">Включить</span>
                    </label>
                  </div>

                  {dealStructure.subjectTo?.enabled && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={dealStructure.subjectTo.downPayment}
                              onChange={(e) => setDealStructure(prev => ({
                                ...prev,
                                subjectTo: { ...prev.subjectTo!, downPayment: Number(e.target.value) }
                              }))}
                              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="1"
                              max="1000"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Символический платеж (рекомендуется $10)</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Closing Costs</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={dealStructure.subjectTo.closingCosts}
                              onChange={(e) => setDealStructure(prev => ({
                                ...prev,
                                subjectTo: { ...prev.subjectTo!, closingCosts: Number(e.target.value) }
                              }))}
                              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Расходы на оформление сделки</p>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <i className="ri-information-line text-blue-600 mt-0.5"></i>
                          <div>
                            <h4 className="font-medium text-blue-900 mb-1">Преимущества Subject to:</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• Банк продолжает получать платежи - нет причины возражать</li>
                              <li>• Минимальные стартовые вложения</li>
                              <li>• Быстрое оформление сделки</li>
                              <li>• Продавец избегает foreclosure</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={dealStructure.subjectTo.authorizationLetter}
                          onChange={(e) => setDealStructure(prev => ({
                            ...prev,
                            subjectTo: { ...prev.subjectTo!, authorizationLetter: e.target.checked }
                          }))}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Получить Authorization Letter для общения с банком</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Seller Financing Option */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <i className="ri-bank-line text-purple-600"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Seller Financing</h3>
                        <p className="text-sm text-gray-500">Продавец становится &quot;банком&quot; для части суммы</p>
                      </div>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dealStructure.sellerFinancing?.enabled || false}
                        onChange={(e) => enableSellerFinancing(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-sm font-medium">Включить</span>
                    </label>
                  </div>

                  {dealStructure.sellerFinancing?.enabled && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Сумма займа</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={dealStructure.sellerFinancing.amount}
                              onChange={(e) => updateSellerFinancing('amount', Number(e.target.value))}
                              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Процентная ставка</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={dealStructure.sellerFinancing.interestRate}
                              onChange={(e) => updateSellerFinancing('interestRate', Number(e.target.value))}
                              className="w-full pr-8 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              step="0.1"
                              min="1"
                              max="15"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Срок (лет)</label>
                          <input
                            type="number"
                            value={dealStructure.sellerFinancing.term}
                            onChange={(e) => updateSellerFinancing('term', Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="1"
                            max="30"
                          />
                        </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <i className="ri-lightbulb-line text-purple-600 mt-0.5"></i>
                          <div>
                            <h4 className="font-medium text-purple-900 mb-1">Выгода для продавца:</h4>
                            <ul className="text-sm text-purple-700 space-y-1">
                              <li>• Получает {dealStructure.sellerFinancing.interestRate}% годовых (лучше банковских депозитов)</li>
                              <li>• Стабильный ежемесячный доход ${dealStructure.sellerFinancing.monthlyPayment}</li>
                              <li>• Обеспеченность недвижимостью</li>
                              <li>• Налоговые преимущества рассрочки платежа</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={dealStructure.sellerFinancing.securement}
                          onChange={(e) => updateSellerFinancing('securement', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Оформить Securement (обременение) на недвижимость</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Wrap-Around Mortgage Option */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <i className="ri-refresh-line text-orange-600"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Wrap-Around Mortgage</h3>
                        <p className="text-sm text-gray-500">Новый займ, который &quot;оборачивает&quot; существующую ипотеку</p>
                      </div>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dealStructure.wrapAround?.enabled || false}
                        onChange={(e) => enableWrapAround(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-sm font-medium">Включить</span>
                    </label>
                  </div>

                  {dealStructure.wrapAround?.enabled && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Новый ежемесячный платеж</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={dealStructure.wrapAround.newMonthlyPayment}
                              onChange={(e) => updateWrapAround('newMonthlyPayment', Number(e.target.value))}
                              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Процентная ставка</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={dealStructure.wrapAround.newInterestRate}
                              onChange={(e) => updateWrapAround('newInterestRate', Number(e.target.value))}
                              className="w-full pr-8 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              step="0.1"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <i className="ri-money-dollar-circle-line text-orange-600 mt-0.5"></i>
                          <div>
                            <h4 className="font-medium text-orange-900 mb-1">Генерируемый Cash Flow:</h4>
                            <ul className="text-sm text-orange-700 space-y-1">
                              <li>• Покупатель платит: ${dealStructure.wrapAround.newMonthlyPayment}/мес</li>
                              <li>• Существующий платеж: ${dealStructure.wrapAround.existingPayment}/мес</li>
                              <li>• <strong>Ваша прибыль: ${dealStructure.wrapAround.monthlyProfit}/мес</strong></li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>Профиль покупателя:</strong> {dealStructure.wrapAround.buyerProfile}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lease with Option Option */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <i className="ri-key-line text-indigo-600"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Lease with Option to Purchase</h3>
                        <p className="text-sm text-gray-500">Аренда с правом выкупа (Call Option)</p>
                      </div>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dealStructure.leaseOption?.enabled || false}
                        onChange={(e) => enableLeaseOption(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-sm font-medium">Включить</span>
                    </label>
                  </div>

                  {dealStructure.leaseOption?.enabled && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={dealStructure.leaseOption.downPayment}
                              onChange={(e) => updateLeaseOption('downPayment', Number(e.target.value))}
                              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Месячная аренда</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={dealStructure.leaseOption.monthlyRent}
                              onChange={(e) => updateLeaseOption('monthlyRent', Number(e.target.value))}
                              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Срок опциона (мес)</label>
                          <input
                            type="number"
                            value={dealStructure.leaseOption.optionTerm}
                            onChange={(e) => updateLeaseOption('optionTerm', Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Цена опциона</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={dealStructure.leaseOption.optionPrice}
                              onChange={(e) => updateLeaseOption('optionPrice', Number(e.target.value))}
                              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Кредит с аренды</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={dealStructure.leaseOption.rentCredit}
                              onChange={(e) => updateLeaseOption('rentCredit', Number(e.target.value))}
                              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Часть аренды засчитывается в покупку</p>
                        </div>
                      </div>

                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <i className="ri-user-heart-line text-indigo-600 mt-0.5"></i>
                          <div>
                            <h4 className="font-medium text-indigo-900 mb-1">Мотивация покупателя:</h4>
                            <p className="text-sm text-indigo-700">{dealStructure.leaseOption.buyerMotivation}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm text-green-700">
                          <p><strong>Ваша прибыль:</strong> ${(dealStructure.leaseOption.monthlyRent - (scenario.property.monthlyPayment || 0)).toLocaleString()}/мес + потенциальный рост цены</p>
                          <p><strong>Общий кредит покупателя:</strong> ${(dealStructure.leaseOption.downPayment + dealStructure.leaseOption.rentCredit * dealStructure.leaseOption.optionTerm).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Wholesale Contract Option */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                        <i className="ri-exchange-line text-teal-600"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Wholesale Contract Assignment</h3>
                        <p className="text-sm text-gray-500">Переуступка контракта другому инвестору</p>
                      </div>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dealStructure.wholesale?.enabled || false}
                        onChange={(e) => enableWholesale(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-sm font-medium">Включить</span>
                    </label>
                  </div>

                  {dealStructure.wholesale?.enabled && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Цена по контракту</label>
                          <div className="bg-gray-100 px-4 py-2 rounded-lg">
                            <span className="text-gray-700 font-medium">${dealStructure.wholesale.contractPrice.toLocaleString()}</span>
                            <p className="text-xs text-gray-500">75% от FMV</p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Fee</label>
                          <div className="bg-green-100 px-4 py-2 rounded-lg">
                            <span className="text-green-700 font-medium">${dealStructure.wholesale.assignmentFee.toLocaleString()}</span>
                            <p className="text-xs text-green-600">Ваша прибыль</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-teal-50 p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <i className="ri-user-search-line text-teal-600 mt-0.5"></i>
                          <div>
                            <h4 className="font-medium text-teal-900 mb-2">Поиск Cash Buyer:</h4>
                            <div className="text-sm text-teal-700 space-y-1">
                              <p>• <strong>Тип покупателя:</strong> {dealStructure.wholesale.cashBuyerType}</p>
                              <p>• <strong>Время на поиск:</strong> {dealStructure.wholesale.marketingDays} дней</p>
                              <p>• <strong>Финальная цена:</strong> ${(dealStructure.wholesale.contractPrice + dealStructure.wholesale.assignmentFee).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <i className="ri-time-line text-yellow-600"></i>
                          <p className="text-sm text-yellow-700">
                            <strong>Важно:</strong> У вас есть ограниченное время на поиск покупателя по контракту
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Asset Trade Option */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <i className="ri-car-line text-amber-600"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Trade of Assets</h3>
                        <p className="text-sm text-gray-500">Включить дополнительные активы продавца в сделку</p>
                      </div>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dealStructure.assetTrade?.enabled || false}
                        onChange={(e) => enableAssetTrade(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-sm font-medium">Включить</span>
                    </label>
                  </div>

                  {dealStructure.assetTrade?.enabled && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Выбранные активы продавца:</h4>
                        <div className="space-y-3">
                          {dealStructure.assetTrade.assets.map((asset, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                  <i className={`${asset.type === 'vehicle' ? 'ri-car-line' : asset.type === 'boat' ? 'ri-ship-line' : 'ri-diamond-line'} text-amber-600`}></i>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{asset.description}</p>
                                  <p className="text-sm text-gray-500">Оценочная стоимость</p>
                                </div>
                              </div>
                              <span className="font-semibold text-amber-700">${asset.value.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-amber-50 p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <i className="ri-scales-line text-amber-600 mt-0.5"></i>
                          <div>
                            <h4 className="font-medium text-amber-900 mb-1">Интеграция в сделку:</h4>
                            <p className="text-sm text-amber-700 mb-2">{dealStructure.assetTrade.integrationMethod}</p>
                            <p className="text-sm text-amber-800"><strong>Общая стоимость активов:</strong> ${dealStructure.assetTrade.totalValue.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>Особенно эффективно</strong> для сделок с LTV {'>'} 100% или отрицательной equity
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 'documentation' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Документооборот сделки</h3>

                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div key={doc.type} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <i className="ri-file-text-line text-blue-600"></i>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{doc.name}</h4>
                              <p className="text-sm text-gray-500">{doc.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDocumentStatusColor(doc.status)}`}>
                              {getDocumentStatusText(doc.status)}
                            </span>
                            {doc.status !== 'signed' && (
                              <button
                                onClick={() => signDocument(doc.type)}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
                              >
                                {doc.status === 'draft' ? 'Подготовить' : 'Подписать'}
                              </button>
                            )}
                          </div>
                        </div>

                        {doc.status === 'ready' && (
                          <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-700">
                            Документ готов к подписанию. Убедитесь, что все условия соответствуют договоренностям.
                          </div>
                        )}

                        {doc.status === 'signed' && (
                          <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700 flex items-center space-x-2">
                            <i className="ri-check-line"></i>
                            <span>Документ подписан и имеет юридическую силу</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'closing' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Закрытие сделки</h3>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <i className="ri-trophy-line text-green-600 text-xl"></i>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-green-900">Поздравляем с креативной сделкой!</h4>
                          <p className="text-green-700">Правильно структурированная сделка - ценный товар</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-2">Итоги для вас:</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Стартовые вложения:</span>
                              <span className="font-medium">${dealStructure.totalStructure.totalDownPayment.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Месячная прибыль:</span>
                              <span className="font-medium text-green-600">${dealStructure.totalStructure.userMonthlyProfit.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Получена собственность:</span>
                              <span className="font-medium text-green-600">${scenario.property.fmv.toLocaleString()}</span>
                            </div>
                            {dealStructure.wholesale?.enabled && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Assignment Fee:</span>
                                <span className="font-medium text-green-600">${dealStructure.wholesale.assignmentFee.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-2">Итоги для продавца:</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Избежал foreclosure:</span>
                              <span className="font-medium text-green-600">✓</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Месячный доход:</span>
                              <span className="font-medium">${dealStructure.totalStructure.sellerMonthlyIncome.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Кредитная история:</span>
                              <span className="font-medium text-green-600">Сохранена</span>
                            </div>
                            {dealStructure.assetTrade?.enabled && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Активы в сделке:</span>
                                <span className="font-medium">${dealStructure.assetTrade.totalValue.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-2">Структура сделки:</h5>
                          <div className="space-y-1 text-xs">
                            {dealStructure.subjectTo?.enabled && <p className="text-blue-600">✓ Subject to</p>}
                            {dealStructure.sellerFinancing?.enabled && <p className="text-purple-600">✓ Seller Financing</p>}
                            {dealStructure.wrapAround?.enabled && <p className="text-orange-600">✓ Wrap-Around</p>}
                            {dealStructure.leaseOption?.enabled && <p className="text-indigo-600">✓ Lease Option</p>}
                            {dealStructure.wholesale?.enabled && <p className="text-teal-600">✓ Wholesale</p>}
                            {dealStructure.assetTrade?.enabled && <p className="text-amber-600">✓ Asset Trade</p>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Link href="/scenario-generator" className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer">
                        Новый сценарий
                      </Link>
                      <Link href="/profile" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
                        Посмотреть портфель
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Итоги структуры</h3>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Основные показатели</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Цена покупки:</span>
                      <span className="font-medium">${scenario.property.fmv.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Стартовые вложения:</span>
                      <span className={`font-medium ${dealStructure.totalStructure.totalDownPayment < 5000 ? 'text-green-600' : 'text-orange-600'}`}>
                        ${dealStructure.totalStructure.totalDownPayment.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ваша месячная прибыль:</span>
                      <span className="font-medium text-green-600">${dealStructure.totalStructure.userMonthlyProfit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {dealStructure.wrapAround?.enabled && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-2">Wrap-Around</h4>
                    <div className="space-y-1 text-xs text-orange-700">
                      <p>• Новый платеж: ${dealStructure.wrapAround.newMonthlyPayment}</p>
                      <p>• Существующий: ${dealStructure.wrapAround.existingPayment}</p>
                      <p>• Прибыль: ${dealStructure.wrapAround.monthlyProfit}/мес</p>
                    </div>
                  </div>
                )}

                {dealStructure.leaseOption?.enabled && (
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="font-medium text-indigo-900 mb-2">Lease Option</h4>
                    <div className="space-y-1 text-xs text-indigo-700">
                      <p>• Down payment: ${dealStructure.leaseOption.downPayment.toLocaleString()}</p>
                      <p>• Аренда: ${dealStructure.leaseOption.monthlyRent}/мес</p>
                      <p>• Срок опциона: {dealStructure.leaseOption.optionTerm} мес</p>
                      <p>• Цена опциона: ${dealStructure.leaseOption.optionPrice.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {dealStructure.wholesale?.enabled && (
                  <div className="p-4 bg-teal-50 rounded-lg">
                    <h4 className="font-medium text-teal-900 mb-2">Wholesale Assignment</h4>
                    <div className="space-y-1 text-xs text-teal-700">
                      <p>• Контракт: ${dealStructure.wholesale.contractPrice.toLocaleString()}</p>
                      <p>• Assignment Fee: ${dealStructure.wholesale.assignmentFee.toLocaleString()}</p>
                      <p>• Поиск: {dealStructure.wholesale.marketingDays} дней</p>
                    </div>
                  </div>
                )}

                {dealStructure.assetTrade?.enabled && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-medium text-amber-900 mb-2">Asset Trade</h4>
                    <div className="space-y-1 text-xs text-amber-700">
                      <p>• Активов: {dealStructure.assetTrade.assets.length}</p>
                      <p>• Общая стоимость: ${dealStructure.assetTrade.totalValue.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {
                  const dealKeys: Array<keyof Omit<DealStructure, 'totalStructure'>> = [
                    'subjectTo',
                    'sellerFinancing',
                    'wrapAround',
                    'leaseOption',
                    'wholesale',
                    'assetTrade',
                  ];
                  (dealKeys.some(key => dealStructure[key]?.enabled)) && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="ri-gem-line text-purple-600"></i>
                      <span className="font-medium text-purple-900">Аксиома #6 выполнена!</span>
                    </div>
                    <p className="text-xs text-purple-700">
                      Правильно структурированная сделка создает ценность для всех участников
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Документы: {documents.filter(d => d.status === 'signed').length}/{documents.length} подписаны</p>
                    <p>Статус: {currentStep === 'closing' ? 'Сделка завершена' : 'В процессе'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DealStructurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <i className="ri-file-settings-line text-white text-xl"></i>
          </div>
          <p className="text-gray-600">Загрузка конструктора сделок...</p>
        </div>
      </div>
    }>
      <DealStructureContent />
    </Suspense>
  );
}
