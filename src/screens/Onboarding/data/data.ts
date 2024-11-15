import { AnimationObject } from 'lottie-react-native';

export interface OnboardingData {
  id: number;
  animation: AnimationObject;
  text: string;
  textColor: string;
  backgroundColor: string;
}

const data: OnboardingData[] = [
  {
    id: 1,
    animation: require('../assets/loading-1.json'),
    text: 'Capture Every Aspect of Your Farm',
    textColor: 'white',
    backgroundColor: '#001118',
  },
  {
    id: 2,
    animation: require('../assets/loading1.json'),
    text: 'Streamline Your Data Management',
    textColor: 'white',
    backgroundColor: '#004d6d',
  },
  {
    id: 3,
    animation: require('../assets/loading3.json'),
    text: 'Transform Data into Actionable Insights',
    textColor: 'white',
    backgroundColor: '#001118',
  },
];


export default data;
