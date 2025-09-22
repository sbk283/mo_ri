import { Button, Form, Input } from 'antd';
import type { FieldData } from './LoginPage';

interface FormValues {
  email: string;
}
// 인증메일 모달 창 제작 해야합니다.
function FindPwPage() {
  const initialValue: FormValues = {
    email: '',
  };

  const onFiledsChange = (field: FieldData[], allFields: FieldData[]) => {
    console.log(field[0].value);
  };
  // 7. 확인 버튼 클릭시 최종 입력값
  const onFinish = (values: FormValues) => {
    console.log(values);
  };

  return (
    <div className="mt-[140px] mb-[100px]">
      <div className="border border-gray-300 rounded-[5px] bg-white w-[1326px] h-[737px] shadow-card mx-auto flex relative">
        {/* 왼쪽 */}
        <div className="py-[188px] px-[155px]">
          <div>
            <div className="mb-10">
              <p className="text-xxl text-brand font-bold">비밀번호 찾기</p>
              <p className="text-lg">가입시 등록한 이메일로 임시 비밀번호를 보내드립니다.</p>
            </div>
            <div>
              <Form
                layout="vertical"
                initialValues={initialValue}
                onFieldsChange={(field, allFields) => onFiledsChange(field, allFields)}
                onFinish={values => onFinish(values)}
              >
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
                    className="w-[450px] border-t-0 border-l-0 border-r-0 rounded-none border-[#A3A3A3] focus:shadow-none mb-10 "
                    placeholder="아이디를 입력해 주세요."
                  />
                </Form.Item>
              </Form>
            </div>
            <Button className="w-[450px] h-[48px] bg-brand text-white text-xl font-bold rounded-[5px]">
              임시 비밀번호 발송
            </Button>
          </div>
        </div>
        {/* 오른쪽 */}
        <div className="flex justify-center items-center absolute top-[50%] translate-y-[-50%] right-[110px]">
          <img src="findimage.svg" alt="찾기이미지" />
        </div>
      </div>
    </div>
  );
}

export default FindPwPage;
