import { Button, DatePicker, Form, Input } from 'antd';
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Dayjs } from 'dayjs';

type SignUpStep1Props = {
  onNext: (data: any) => void; // 실제 타입에 맞게 수정
  initialData?: any;
};

interface ValueInterface {
  name: string;
  nickname: string;
  birth: Dayjs;
  email: string;
  password: string;
  passwordConfirm: string;
}

const SignUpStep1: React.FC<SignUpStep1Props> = ({ onNext, initialData }) => {
  const { signUp } = useAuth();
  const [msg, setMsg] = useState<string>('');
  const [match, setMatch] = useState(true);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 비밀번호 확인
  const handleChangePassword = () => {
    const pw = form.getFieldValue('password');
    const pwConfirm = form.getFieldValue('passwordConfirm');
    setMatch(pw === pwConfirm || pwConfirm === undefined);
  };

  // 폼 제출 시
  const onFinish = async (values: ValueInterface) => {
    if (!match) {
      setMsg('비밀번호가 서로 다릅니다.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(values.email, values.password);
    setLoading(false);
    if (error) {
      setMsg(`회원가입 오류 : ${error}`);
      return;
    }
    setMsg('회원가입이 성공됐습니다. 이메일 인증 링크를 확인해주세요.');

    onNext({
      ...values,
      birth: values.birth ? values.birth.format('YYYY-MM-DD') : '',
    });
  };

  return (
    <div className="y-full py-[40px] px-[107px]">
      <div className="flex items-center gap-4 mb-5">
        <div className="text-xxl font-bold text-brand whitespace-nowrap">회원가입</div>
        <div className="flex items-center gap-3 whitespace-nowrap">
          <span className="text-brand font-bold text-lg">01_ 기본 정보 작성</span>
          <img className="w-[15px] h-[15px]" src="/arrow_sm.svg" alt="화살표" />
          <span className=" font-bold text-lg text-gray-600">02_ 관심사 선택</span>
        </div>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFieldsChange={() => handleChangePassword()}
        onFinish={onFinish}
        initialValues={initialData}
      >
        <div className="mb-[50px]">
          <div className="flex gap-3">
            <Form.Item
              label={<p className="font-bold text-gray-600">이름</p>}
              name="name"
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
              name="nickname"
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
            name="birth"
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
            name="email"
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
            name="password"
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
            />
          </Form.Item>
          <Form.Item
            label={<p className="font-bold text-gray-600">비밀번호 확인</p>}
            name="passwordConfirm"
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
            />
          </Form.Item>
          {!match && <div style={{ color: 'red' }}>비밀번호가 다릅니다.</div>}
        </div>
        <Form.Item className="mx-auto">
          <Button
            htmlType="submit"
            className="w-[450px] h-[48px] bg-brand text-white text-xl font-bold rounded-[5px]"
            disabled={!match || loading}
          >
            {loading ? '확인중...' : '다음단계'}
          </Button>
        </Form.Item>
        {msg && <div style={{ color: msg.includes('성공') ? 'green' : 'red' }}>{msg}</div>}
      </Form>
    </div>
  );
};

export default SignUpStep1;
