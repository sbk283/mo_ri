import React from 'react';
import App from './App';
import { useGroup } from './contexts/GroupContext';
import { GroupMemberProvider } from './contexts/GroupMemberContext';
import { ScheduleProvider } from './contexts/ScheduleContext';

/**
 * GroupProvider 내부에서 GroupContext의 함수를 꺼내서
 * GroupMemberProvider로 연결해주는 `다리 역할`
 */

const AppWrapper: React.FC = () => {
  const { updateMemberCount } = useGroup();

  return (
    <GroupMemberProvider onMemberCountChange={updateMemberCount}>
      <ScheduleProvider>
        <App />
      </ScheduleProvider>
    </GroupMemberProvider>
  );
};

export default AppWrapper;
