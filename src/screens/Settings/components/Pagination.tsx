import {StyleSheet, View} from 'react-native';
import React from 'react';
import {dataReachFeatures} from '../data/data';
import Dot from './Dot';

type Props = {
  paginationIndex: number;
};
const Pagination = ({paginationIndex}: Props) => {
  return (
    <View style={styles.container}>
      {dataReachFeatures.map((_, index) => {
        return (
          <Dot index={index} key={index} paginationIndex={paginationIndex} />
        );
      })}
    </View>
  );
};

export default Pagination;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
