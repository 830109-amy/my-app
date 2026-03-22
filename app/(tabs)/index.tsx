import { useState, useMemo, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, SafeAreaView, Modal, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAYS_OF_WEEK = ['日', '一', '二', '三', '四', '五', '六'];
const YEARS = Array.from({ length: 21 }, (_, i) => 2020 + i);
const MONTHS_NAME = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Q 版水豚君組件
function CapybaraMascot() {
  return (
    <View style={styles.capyContainer}>
      <View style={styles.capyBody}>
        <View style={[styles.capyEar, { left: 10 }]} />
        <View style={[styles.capyEar, { right: 10 }]} />
        <View style={[styles.capyEye, { left: 25 }]} />
        <View style={[styles.capyEye, { right: 25 }]} />
        <View style={styles.capyMuzzle}>
          <View style={styles.capyNose} />
        </View>
      </View>
      <View style={styles.speechBubble}>
        <Text style={styles.speechText}>今天也要好好吃飯哦～</Text>
      </View>
    </View>
  );
}

function MonthCalendar({ year, month, recordedDates }: { year: number; month: number; recordedDates: string[] }) {
  const router = useRouter();
  const monthData = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    return { daysInMonth, startDay };
  }, [year, month]);

  const renderDays = () => {
    const cells = [];
    for (let i = 0; i < monthData.startDay; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }
    for (let i = 1; i <= monthData.daysInMonth; i++) {
      const dateKey = `record_${year}_${month + 1}_${i}`;
      const hasRecord = recordedDates.includes(dateKey);

      cells.push(
        <TouchableOpacity 
          key={`day-${i}`} 
          style={styles.dayCell}
          onPress={() => router.push({
            pathname: "/modal",
            params: { year, month: month + 1, day: i }
          })}
        >
          <View style={styles.dayContent}>
            <Text style={styles.dayText}>{i}</Text>
            {hasRecord && <View style={styles.recordDot} />}
          </View>
        </TouchableOpacity>
      );
    }
    return cells;
  };

  return (
    <View style={styles.calendarCard}>
      <View style={styles.weekHeader}>
        {DAYS_OF_WEEK.map(d => (
          <Text key={d} style={styles.weekHeaderText}>{d}</Text>
        ))}
      </View>
      <View style={styles.daysGrid}>
        {renderDays()}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isYearPickerVisible, setYearPickerVisible] = useState(false);
  const [recordedDates, setRecordedDates] = useState<string[]>([]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const fetchRecordedDates = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const recordKeys = keys.filter(key => key.startsWith('record_'));
      setRecordedDates(recordKeys);
    } catch (e) {
      console.error('讀取紀錄清單失敗', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRecordedDates();
    }, [fetchRecordedDates])
  );

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentYear, currentMonth + offset, 1);
    setCurrentDate(newDate);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <Text style={styles.mainTitle}>年度飲食紀錄</Text>
          <TouchableOpacity 
            style={styles.yearSelector} 
            onPress={() => setYearPickerVisible(true)}
          >
            <Text style={styles.yearSelectorText}>{currentYear} 年</Text>
            <Ionicons name="chevron-down" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.monthNavigator}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}>
            <Ionicons name="chevron-back" size={32} color="#000" />
          </TouchableOpacity>
          
          <Text style={styles.currentMonthText}>{MONTHS_NAME[currentMonth]}</Text>
          
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={32} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarContainer}>
          <MonthCalendar year={currentYear} month={currentMonth} recordedDates={recordedDates} />
        </View>

        <CapybaraMascot />

        <Modal
          visible={isYearPickerVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setYearPickerVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setYearPickerVisible(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>選擇年份</Text>
              <FlatList
                data={YEARS}
                keyExtractor={(item) => item.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.yearItem, item === currentYear && styles.selectedYearItem]}
                    onPress={() => {
                      setCurrentDate(new Date(item, currentMonth, 1));
                      setYearPickerVisible(false);
                    }}
                  >
                    <Text style={[styles.yearItemText, item === currentYear && styles.selectedYearItemText]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                style={styles.yearList}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContainer: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#000000',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  yearSelectorText: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 4,
    color: '#00',
  },
  monthNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  navButton: {
    padding: 10,
  },
  currentMonthText: {
    fontSize: 32,
    fontWeight: '900',
    marginHorizontal: 30,
    color: '#000',
  },
  calendarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  calendarCard: {
    width: SCREEN_WIDTH * 0.9,
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 16,
    padding: 15,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
    marginBottom: 10,
  },
  weekHeaderText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: '16.6%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recordDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#81C784',
    marginTop: 2,
  },
  capyContainer: {
    alignItems: 'center',
    marginTop: 20,
    flex: 1,
    justifyContent: 'flex-start',
  },
  capyBody: {
    width: 120,
    height: 90,
    backgroundColor: '#A67C52',
    borderRadius: 40,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#5D4037',
  },
  capyEar: {
    width: 15,
    height: 15,
    backgroundColor: '#A67C52',
    borderRadius: 8,
    position: 'absolute',
    top: -5,
    borderWidth: 2,
    borderColor: '#5D4037',
  },
  capyEye: {
    width: 8,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    position: 'absolute',
    top: 30,
  },
  capyMuzzle: {
    width: 40,
    height: 30,
    backgroundColor: '#8D6E63',
    borderRadius: 15,
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  capyNose: {
    width: 10,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
  },
  speechBubble: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 15,
    padding: 10,
    marginTop: 15,
    position: 'relative',
  },
  speechText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#000',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  yearList: {
    width: '100%',
  },
  yearItem: {
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  selectedYearItem: {
    backgroundColor: '#000',
  },
  yearItemText: {
    fontSize: 18,
    color: '#000',
  },
  selectedYearItemText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
