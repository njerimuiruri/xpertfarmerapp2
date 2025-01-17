import {AnimationObject} from 'lottie-react-native';
import {COLORS} from '../../../constants/theme';

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
    animation: require('../../../assets/images/onboardingScreen1.png'),
    text: 'Capture Every Aspect of Your Farm',
    textColor: 'white',
    backgroundColor: COLORS.green2,
  },
  {
    id: 2,
    animation: require('../../../assets/images/onboardingScreen2.png'),
    text: 'Streamline Your Data Management',
    textColor: 'white',
    backgroundColor: COLORS.green2,
  },
  {
    id: 3,
    animation: require('../../../assets/images/onboardingScreen3.png'),
    text: 'Transform Data into Actionable Insights',
    textColor: 'white',
    backgroundColor: COLORS.green2,
  },
];

export default data;
