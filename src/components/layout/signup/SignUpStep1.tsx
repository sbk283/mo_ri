import { Button, DatePicker, Form, Input } from 'antd';
import type { BasicInfo } from '../../../pages/SignUpPage';
import type { FieldData } from '../../../pages/LoginPage';
import { useState } from 'react';

type SignUpStep1Props = {
  onNext: (data: BasicInfo) => void;
  initialData?: BasicInfo | null;
};
interface ValueInterface {
  name: string;
  nickname: string;
  birth: string;
  email: string;
  password: string;
}

const SignUpStep1: React.FC<SignUpStep1Props> = ({ onNext, initialData }) => {
  const initialValue = {
    name: '',
    nickname: '',
    birth: '',
    email: '',
    password: '',
  };

  const onFiledsChange = (field: FieldData[], allFields: FieldData[]) => {
    console.log(field[0].value);
  };
  // 7. 확인 버튼 클릭시 최종 입력값
  const onFinish = (values: ValueInterface) => {
    console.log(values);
    onNext(values);
  };

  const [match, setMetch] = useState(true);
  // 2. Ant Design 에서 Form 요소를 저장해 두고 참조하기
  const [form] = Form.useForm();
  // 3. 비밀번호가 바뀔 때 마다 체크함.
  const handleChangePassword = () => {
    // name 이 password 인 필드의 값, 즉 value 읽기
    const pw = form.getFieldValue('password');
    // name 이 passwordConfirm 인 필드의 값, 즉 value 읽기
    const pwConfirm = form.getFieldValue('passwordConfirm');
    if (pwConfirm) {
      setMetch(pw === pwConfirm);
    }
  };

  return (
    <div className=" y-full py-[40px] px-[107px]">
      <div className="flex items-center gap-4 mb-5">
        <div className="text-xxl font-bold text-brand whitespace-nowrap">회원가입</div>
        <div className="flex items-center gap-3 whitespace-nowrap">
          <span className="text-brand font-bold text-lg">01_ 기본 정보 작성</span>
          <img className="w-[15px] h-[15px]" src="/arrow_sm.svg" alt="화살표" />
          <span className=" font-bold text-lg text-gray-600">02_ 관심사 선택</span>
        </div>
      </div>
      <Form
        layout="vertical"
        initialValues={initialValue}
        onFieldsChange={(field, allFields) => onFiledsChange(field, allFields)}
        onFinish={onFinish}
      >
        <div className="mb-[50px]">
          <div className="flex gap-3">
            <Form.Item
              label={<p className="font-bold text-gray-600">이름</p>}
              name={'name'}
              required={false}
              rules={[{ required: true, message: '이름을 입력해 주세요.' }]}
              colon={false}
            >
              <Input
                className="w-[219px] border-t-0 border-l-0 border-r-0 rounded-none border-[#A3A3A3] focus:shadow-none "
                placeholder="이름을 입력해 주세요."
              />
            </Form.Item>
            <Form.Item
              label={<p className="font-bold text-gray-600">닉네임</p>}
              name={'nickname'}
              required={false}
              rules={[{ required: true, message: '닉네임을 입력해 주세요.' }]}
              colon={false}
            >
              <Input
                className="w-[219px] border-t-0 border-l-0 border-r-0 rounded-none border-[#A3A3A3] focus:shadow-none "
                placeholder="닉네임을 입력해 주세요."
              />
            </Form.Item>
          </div>
          <Form.Item
            label={<p className="font-bold text-gray-600">생년월일</p>}
            name={'birth'}
            required={false}
            rules={[{ required: true, message: '생년월일을 선택해주세요.' }]}
            colon={false}
          >
            <DatePicker
              className="w-[450px] border-[#A3A3A3]"
              placeholder="생년월일을 선택해주세요."
            />
          </Form.Item>
          <Form.Item
            label={<p className="font-bold text-gray-600">이메일 (아이디)</p>}
            name={'email'}
            required={false}
            rules={[
              { required: true, message: '아이디를 입력해 주세요.' },
              { type: 'email', message: '아이디 형식에 맞지 않습니다.' },
            ]}
            colon={false}
          >
            <Input
              className="w-[450px] border-t-0 border-l-0 border-r-0 rounded-none border-[#A3A3A3] focus:shadow-none "
              placeholder="아이디를 입력해 주세요."
            />
          </Form.Item>
          <Form.Item
            label={<p className="font-bold text-gray-600">비밀번호</p>}
            name={'password'}
            required={false}
            rules={[
              { required: true, message: '비밀번호를 입력해 주세요.' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/,
                message: '비밀번호는 8~16자 이며, 대소문자, 숫자를 포함해야 합니다.',
              },
            ]}
            colon={false}
          >
            <Input.Password
              className="w-[450px] border-t-0 border-l-0 border-r-0 rounded-none border-[#A3A3A3] !focus:shadow-none "
              placeholder="비밀번호를 입력하세요."
              onChange={handleChangePassword}
            />
          </Form.Item>
          <Form.Item
            label={<p className="font-bold text-gray-600">비밀번호 확인</p>}
            name={'passwordConfirm'}
            required={false}
            rules={[
              { required: true, message: '비밀번호를 입력해 주세요.' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/,
                message: '비밀번호는 8~16자 이며, 대소문자, 숫자를 포함해야 합니다.',
              },
            ]}
            colon={false}
          >
            <Input.Password
              className="w-[450px] border-t-0 border-l-0 border-r-0 rounded-none border-[#A3A3A3] !focus:shadow-none "
              placeholder="비밀번호를 다시 입력해 주세요."
              onChange={handleChangePassword}
            />
          </Form.Item>
          {!match && <div style={{ color: 'red' }}>비밀번호가 다릅니다.</div>}
        </div>
        <Form.Item className="mx-auto">
          <Button
            htmlType="submit"
            className="w-[450px] h-[48px] bg-brand text-white text-xl font-bold rounded-[5px]"
            disabled={!match}
          >
            다음단계
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SignUpStep1;
