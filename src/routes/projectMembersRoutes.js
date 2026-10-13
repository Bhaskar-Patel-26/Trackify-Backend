import express from 'express';
import { addMember, listMembers, updateMemberRole, removeMember } from '../controllers/projectMembersController.js';
import { authenticate } from '../utils/jwt.js';

const router = express.Router({ mergeParams: true }); // important to read :projectId

router.post('/', authenticate, addMember);                // POST /api/projects/:projectId/members
router.get('/', listMembers);               // GET  /api/projects/:projectId/members
router.put('/:userId', updateMemberRole);   // PUT  /api/projects/:projectId/members/:userId
router.delete('/:userId', authenticate, removeMember);    // DELETE /api/projects/:projectId/members/:userId

export default router;
