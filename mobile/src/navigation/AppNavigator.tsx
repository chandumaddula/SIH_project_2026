import React, { useState } from 'react';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OfficerHomeScreen } from '../screens/officer/OfficerHomeScreen';
import { InspectionDetailScreen } from '../screens/officer/InspectionDetailScreen';
import { CitizenHomeScreen } from '../screens/citizen/CitizenHomeScreen';
import { ComplaintScreen } from '../screens/citizen/ComplaintScreen';
import { ScanScreen } from '../screens/scanner/ScanScreen';
import { ScanResultScreen } from '../screens/scanner/ScanResultScreen';
import { ReportListScreen } from '../screens/reports/ReportListScreen';
import { ReportDetailScreen } from '../screens/reports/ReportDetailScreen';

export const AppNavigator = () => {
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [params, setParams] = useState<any>({});

  const navigation = {
    navigate: (screen: string, screenParams?: any) => {
      setCurrentScreen(screen);
      if (screenParams) setParams(screenParams);
    },
    goBack: () => {
      setCurrentScreen('Login');
    }
  };

  switch (currentScreen) {
    case 'Login':
      return <LoginScreen navigation={navigation} />;
    case 'Register':
      return <RegisterScreen navigation={navigation} />;
    case 'OfficerHome':
      return <OfficerHomeScreen navigation={navigation} />;
    case 'InspectionDetail':
      return <InspectionDetailScreen navigation={navigation} route={{ params }} />;
    case 'CitizenHome':
      return <CitizenHomeScreen navigation={navigation} />;
    case 'Complaint':
      return <ComplaintScreen navigation={navigation} />;
    case 'Scan':
      return <ScanScreen navigation={navigation} />;
    case 'ScanResult':
      return <ScanResultScreen navigation={navigation} />;
    case 'ReportList':
      return <ReportListScreen navigation={navigation} />;
    case 'ReportDetail':
      return <ReportDetailScreen navigation={navigation} route={{ params }} />;
    default:
      return <LoginScreen navigation={navigation} />;
  }
};
