import React from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
// import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Foundation from 'react-native-vector-icons/Foundation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Zocial from 'react-native-vector-icons/Zocial';
import Fontisto from 'react-native-vector-icons/Fontisto';

// type IconProps = {
//   library:
//     | 'AntDesign'
//     | 'Entypo'
//     | 'EvilIcons'
//     | 'Feather'
//     | 'FontAwesome'
//     | 'FontAwesome5'
//     | 'Foundation'
//     | 'Ionicons'
//     | 'MaterialIcons'
//     | 'MaterialCommunityIcons'
//     | 'Octicons'
//     | 'SimpleLineIcons'
//     | 'Zocial'
//     | 'Fontisto'
//     | 'FontAwesome6';
//   name: string;
//   size: number;
//   color: string;
//   style?: any;
// };

const CustomIcon = ({ library, name, size, color, style }) => {
  let IconComponent;

  switch (library) {
    case 'AntDesign':
      IconComponent = AntDesign;
      break;
    case 'Entypo':
      IconComponent = Entypo;
      break;
    case 'EvilIcons':
      IconComponent = EvilIcons;
      break;
    case 'Feather':
      IconComponent = Feather;
      break;
    case 'FontAwesome':
      IconComponent = FontAwesome;
      break;
    case 'FontAwesome5':
      IconComponent = FontAwesome5;
      break;
    case 'Foundation':
      IconComponent = Foundation;
      break;
    case 'Ionicons':
      IconComponent = Ionicons;
      break;
    case 'MaterialIcons':
      IconComponent = MaterialIcons;
      break;
    case 'MaterialCommunityIcons':
      IconComponent = MaterialCommunityIcons;
      break;
    case 'Octicons':
      IconComponent = Octicons;
      break;
    case 'SimpleLineIcons':
      IconComponent = SimpleLineIcons;
      break;
    case 'Zocial':
      IconComponent = Zocial;
      break;
    case 'Fontisto':
      IconComponent = Fontisto;
      break;
    // case 'FontAwesome6':
    //   IconComponent = FontAwesome6;
    //   break;
    default:
      return null; // Fallback if the library is not supported
  }

  return <IconComponent name={name} size={size} color={color} style={style} />;
};

export default CustomIcon;
