import { useState, useEffect } from 'react';
import { Droplet, TrendingDown, TrendingUp, AlertTriangle, Clock, Building } from 'lucide-react';
import { analyzeBloodShortages, getSeverityBadge } from '../../services/shortageAlertService';

/**
 * Blood Inventory Dashboard
 * Displays real-time blood inventory status and shortage predictions
 */

const BloodInventoryDashboard = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadInventoryData();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadInventoryData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const analysis = await analyzeBloodShortages();
      setInventoryData(analysis);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityStats = () => {
    const stats = {
      critical: inventoryData.filter(item => item.severity === 'critical').length,
      low: inventoryData.filter(item => item.severity === 'low').length,
      warning: inventoryData.filter(item => item.severity === 'warning').length,
      stable: inventoryData.filter(item => item.severity === 'stable').length
    };
    return stats;
  };

  const stats = getSeverityStats();

  if (loading && inventoryData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading inventory data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block p-3 sm:p-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mb-4">
            <Droplet className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Blood Inventory Dashboard
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-2">
            Real-time blood shortage monitoring & predictions
          </p>
          {lastUpdated && (
            <p className="text-xs sm:text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Critical</h3>
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600">{stats.critical}</p>
            <p className="text-xs text-gray-500 mt-1">Immediate action needed</p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Low</h3>
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600">{stats.low}</p>
            <p className="text-xs text-gray-500 mt-1">Below threshold</p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Warning</h3>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-600">{stats.warning}</p>
            <p className="text-xs text-gray-500 mt-1">Monitoring closely</p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Stable</h3>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600">{stats.stable}</p>
            <p className="text-xs text-gray-500 mt-1">Adequate supply</p>
          </div>
        </div>

        {/* Blood Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {inventoryData.map((item) => {
            const badge = getSeverityBadge(item.severity);
            
            return (
              <div
                key={item.bloodType}
                className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 ${
                  item.severity === 'critical' ? 'border-red-300 animate-pulse' : 
                  item.severity === 'low' ? 'border-orange-300' : 
                  item.severity === 'warning' ? 'border-yellow-300' : 
                  'border-green-300'
                }`}
              >
                {/* Blood Type Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${badge.bg} border-2 ${badge.border}`}>
                      <span className="text-2xl font-bold">{item.bloodType}</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Blood Type</p>
                      <p className="text-xs text-gray-400">{item.bloodType === 'O-' ? 'Universal' : 'Standard'}</p>
                    </div>
                  </div>
                </div>

                {/* Severity Badge */}
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${badge.bg} ${badge.text} border ${badge.border} mb-4`}>
                  <span>{badge.icon}</span>
                  <span className="text-xs font-bold">{badge.label}</span>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Units</span>
                    <span className={`text-lg font-bold ${
                      item.currentUnits <= 10 ? 'text-red-600' : 
                      item.currentUnits <= 25 ? 'text-orange-600' : 
                      'text-green-600'
                    }`}>
                      {item.currentUnits}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Building className="w-3 h-3 mr-1" />
                      Banks with Stock
                    </span>
                    <span className="text-lg font-bold text-gray-700">{item.banksWithStock}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Demand Rate</span>
                    <span className="text-sm font-medium text-gray-700">{item.demandRate}/day</span>
                  </div>

                  {item.severity !== 'stable' && (
                    <div className={`mt-4 p-3 rounded-lg ${badge.bg} border ${badge.border}`}>
                      <p className="text-xs font-medium ${badge.text}">
                        {item.severity === 'critical' 
                          ? '🚨 Immediate donations needed!' 
                          : item.daysUntilShortage === 0
                          ? '⚠️ Shortage imminent'
                          : `⏱️ Shortage predicted in ${item.daysUntilShortage} day${item.daysUntilShortage !== 1 ? 's' : ''}`
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.currentUnits <= 10 ? 'bg-red-600' : 
                        item.currentUnits <= 25 ? 'bg-orange-600' : 
                        item.currentUnits <= 50 ? 'bg-yellow-500' : 
                        'bg-green-600'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (item.currentUnits / 100) * 100)}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-center">
                    {item.currentUnits <= 10 ? 'Critical Level' : 
                     item.currentUnits <= 25 ? 'Low Level' : 
                     item.currentUnits <= 50 ? 'Moderate Level' : 
                     'Good Level'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Banner */}
        {(stats.critical > 0 || stats.low > 0) && (
          <div className="mt-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">
                {stats.critical > 0 ? '🚨 Urgent Action Needed!' : '⚠️ Your Help is Needed!'}
              </h2>
              <p className="text-xl mb-6 opacity-90">
                {stats.critical > 0 
                  ? `${stats.critical} blood type${stats.critical !== 1 ? 's are' : ' is'} critically low. Lives are at risk!`
                  : `${stats.low} blood type${stats.low !== 1 ? 's are' : ' is'} running low. Help prevent a shortage!`
                }
              </p>
              <button className="bg-white text-red-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:scale-105">
                Donate Now
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">How Our Prediction Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Real-Time Monitoring</h4>
              <p className="text-sm text-gray-600">
                We track blood bank inventory across all registered facilities in real-time
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingDown className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Demand Analysis</h4>
              <p className="text-sm text-gray-600">
                Our AI analyzes recent emergency requests to predict future demand patterns
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Proactive Alerts</h4>
              <p className="text-sm text-gray-600">
                Eligible donors receive notifications before shortages occur, preventing crises
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodInventoryDashboard;
