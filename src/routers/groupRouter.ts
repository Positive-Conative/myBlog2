import express, { Router } from 'express';
const router: Router = express.Router();

import groupController from '../controllers/groupController';

// 그룹 정보 확인
router.get('/one/:groupIdx', groupController.getGroupInfo);

// 그룹 추가
router.post('/add', groupController.addGroup);

// 그룹 정보 수정
router.put('/:groupIdx', groupController.modifyGroup);

// 그룹 상태 변경
router.delete('/:groupIdx', groupController.setGroupFlag);

export default router;